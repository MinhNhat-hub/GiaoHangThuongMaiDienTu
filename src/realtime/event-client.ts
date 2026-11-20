import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@/constants/config';
import { AUTH_CHANGE_EVENT, apiClient } from '@/api/client';
import type { OrderStatusCode, ReturnStatusCode } from '@/constants/status-map';
import type { DeliveryIssueType, ShipmentSummary } from '@/types/api';

export interface OrderCreatedEventPayload {
  orderId: string;
  orderCode?: string;
  code?: string;
  customerId?: string;
  customerName?: string;
  totalItems?: number;
  createdAt?: string;
}

export interface OrderStatusChangedEventPayload {
  orderId: string;
  orderCode?: string;
  code?: string;
  customerId?: string;
  oldStatus: OrderStatusCode | null;
  newStatus: OrderStatusCode;
  changedAt: string;
  changedBy?: string;
  changedByName?: string;
  changedByEmail?: string;
  shipment?: ShipmentSummary | null;
  notes?: string;
}

export interface ShipmentAssignedEventPayload {
  shipmentId: string;
  orderId: string;
  orderCode?: string;
  trackingNumber?: string;
  shipperId?: string;
  address?: string;
}

export interface IssueReportedEventPayload {
  issueId: string;
  orderId: string;
  orderCode?: string;
  issueType: DeliveryIssueType;
  reportedBy?: string;
  notes?: string;
}

export interface ReturnStatusChangedEventPayload {
  requestId: string;
  orderId: string;
  orderCode?: string;
  newStatus: ReturnStatusCode;
  rejectionReason?: string;
}

export interface RealtimeEventPayloads {
  'order.created': OrderCreatedEventPayload;
  'order.status_changed': OrderStatusChangedEventPayload;
  'shipment.assigned': ShipmentAssignedEventPayload;
  'issue.reported': IssueReportedEventPayload;
  'return.status_changed': ReturnStatusChangedEventPayload;
  'realtime:reconnected': { reconnectedAt: string };
}

export type RealtimeEventType = keyof RealtimeEventPayloads;

export interface ConnectionStatus {
  connected: boolean;
  isOffline: boolean;
  isReconnecting: boolean;
}

type EventListenerFn<K extends RealtimeEventType> = (payload: RealtimeEventPayloads[K]) => void;
type StatusListenerFn = (status: ConnectionStatus) => void;

const STREAM_EVENT_TYPES = [
  'order.created',
  'order.status_changed',
  'shipment.assigned',
  'issue.reported',
  'return.status_changed',
] as const;

class RealtimeEventClient {
  private eventSource: EventSource | null = null;
  private listeners = new Map<RealtimeEventType, Set<EventListenerFn<RealtimeEventType>>>();
  private statusListeners = new Set<StatusListenerFn>();
  private browserListenersAttached = false;
  private wasDisconnected = false;
  private status: ConnectionStatus = {
    connected: false,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    isReconnecting: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachBrowserListeners();
    }
  }

  private attachBrowserListeners(): void {
    if (this.browserListenersAttached || typeof window === 'undefined') {
      return;
    }
    this.browserListenersAttached = true;

    window.addEventListener('offline', () => {
      this.wasDisconnected = true;
      this.setStatus({ connected: false, isOffline: true, isReconnecting: false });
    });

    window.addEventListener('online', () => {
      if (!apiClient.getToken()) {
        this.setStatus({ connected: false, isOffline: false, isReconnecting: false });
        return;
      }
      this.wasDisconnected = true;
      this.reconnect();
    });

    window.addEventListener(AUTH_CHANGE_EVENT, () => {
      if (!apiClient.getToken()) {
        this.disconnect();
      } else if (this.hasActiveSubscribers()) {
        this.ensureConnected();
      }
    });
  }

  private hasActiveSubscribers(): boolean {
    for (const group of this.listeners.values()) {
      if (group.size > 0) {
        return true;
      }
    }
    return this.statusListeners.size > 0;
  }

  private setStatus(next: ConnectionStatus): void {
    if (
      this.status.connected === next.connected &&
      this.status.isOffline === next.isOffline &&
      this.status.isReconnecting === next.isReconnecting
    ) {
      return;
    }
    this.status = next;
    for (const listener of this.statusListeners) {
      listener(this.status);
    }
  }

  private openStream(): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }
    if (!apiClient.getToken()) {
      return;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    const source = new EventSource(APP_CONFIG.EVENTS_URL, { withCredentials: true });
    this.eventSource = source;

    source.onopen = () => {
      const recovered = this.wasDisconnected || this.status.isReconnecting || this.status.isOffline;
      this.wasDisconnected = false;
      this.setStatus({ connected: true, isOffline: false, isReconnecting: false });
      if (recovered) {
        this.emit('realtime:reconnected', { reconnectedAt: new Date().toISOString() });
      }
    };

    source.onerror = () => {
      const browserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      this.wasDisconnected = true;
      this.setStatus({
        connected: false,
        isOffline: browserOffline,
        isReconnecting: !browserOffline,
      });
    };

    for (const eventName of STREAM_EVENT_TYPES) {
      source.addEventListener(eventName, (event) => {
        this.handleRawEvent(eventName, (event as MessageEvent<string>).data);
      });
    }

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as {
          event?: string;
          type?: string;
          payload?: unknown;
          data?: unknown;
        };
        const eventName = (parsed.event ?? parsed.type) as RealtimeEventType | undefined;
        if (!eventName || !this.listeners.has(eventName)) {
          return;
        }
        const payload = (parsed.payload ?? parsed.data ?? parsed) as RealtimeEventPayloads[typeof eventName];
        this.emit(eventName, payload);
      } catch {
        void 0;
      }
    };
  }

  private handleRawEvent<K extends (typeof STREAM_EVENT_TYPES)[number]>(
    eventName: K,
    rawData: string
  ): void {
    try {
      const parsed = JSON.parse(rawData) as
        | RealtimeEventPayloads[K]
        | { payload?: RealtimeEventPayloads[K]; data?: RealtimeEventPayloads[K] };
      const payload =
        parsed && typeof parsed === 'object' && ('payload' in parsed || 'data' in parsed)
          ? (parsed.payload ?? parsed.data ?? (parsed as RealtimeEventPayloads[K]))
          : (parsed as RealtimeEventPayloads[K]);
      this.emit(eventName, payload);
    } catch {
      void 0;
    }
  }

  // Ensures an SSE connection is active when an auth token is present.
  ensureConnected(): void {
    this.attachBrowserListeners();
    if (!apiClient.getToken()) {
      return;
    }
    if (!this.eventSource || this.eventSource.readyState === 2) {
      this.openStream();
    }
  }

  // Closes and re-establishes the real-time stream and triggers post-reconnect sync.
  reconnect = (): void => {
    if (!apiClient.getToken()) {
      return;
    }
    const browserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (browserOffline) {
      this.setStatus({ connected: false, isOffline: true, isReconnecting: false });
      return;
    }

    this.wasDisconnected = true;
    this.setStatus({ connected: false, isOffline: false, isReconnecting: true });

    if (typeof EventSource === 'undefined') {
      this.wasDisconnected = false;
      this.setStatus({ connected: true, isOffline: false, isReconnecting: false });
      this.emit('realtime:reconnected', { reconnectedAt: new Date().toISOString() });
      return;
    }

    this.openStream();
    this.wasDisconnected = false;
    this.setStatus({ connected: true, isOffline: false, isReconnecting: false });
    this.emit('realtime:reconnected', { reconnectedAt: new Date().toISOString() });
  };

  // Closes the active real-time connection and resets transient flags.
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.wasDisconnected = false;
    this.setStatus({
      connected: false,
      isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      isReconnecting: false,
    });
  }

  // Dispatches an event payload to all registered listeners for that event type.
  emit<K extends RealtimeEventType>(eventType: K, payload: RealtimeEventPayloads[K]): void {
    const group = this.listeners.get(eventType);
    if (!group) {
      return;
    }
    for (const listener of group) {
      listener(payload);
    }
  }

  // Subscribes to a specific real-time event type and returns an unsubscribe handler.
  subscribe<K extends RealtimeEventType>(eventType: K, listener: EventListenerFn<K>): () => void {
    this.attachBrowserListeners();
    let group = this.listeners.get(eventType);
    if (!group) {
      group = new Set();
      this.listeners.set(eventType, group);
    }
    group.add(listener as EventListenerFn<RealtimeEventType>);
    this.ensureConnected();

    return () => {
      group?.delete(listener as EventListenerFn<RealtimeEventType>);
    };
  }

  // Subscribes to connection and offline state changes.
  subscribeStatus(listener: StatusListenerFn): () => void {
    this.attachBrowserListeners();
    this.statusListeners.add(listener);
    listener(this.status);
    this.ensureConnected();

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  // Returns a snapshot of the current connection state.
  getStatus(): ConnectionStatus {
    return this.status;
  }
}

export const realtimeClient = new RealtimeEventClient();

// Subscribes a React component to live connection and offline status changes.
export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() => realtimeClient.getStatus());

  useEffect(() => {
    return realtimeClient.subscribeStatus(setStatus);
  }, []);

  return status;
}
