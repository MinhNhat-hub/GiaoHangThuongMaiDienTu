import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { realtimeClient } from '@/realtime/event-client';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  readyState = 0;
  closed = false;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: MessageEvent<string>) => void) | null = null;

  constructor(
    public url: string,
    public init?: EventSourceInit
  ) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(): void {}

  close(): void {
    this.closed = true;
    this.readyState = 2;
  }
}

describe('realtime stream session handling', () => {
  let unsubscribe: () => void = () => undefined;

  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal('EventSource', FakeEventSource);
    localStorage.clear();
    apiClient.setToken('token_customer_a');
  });

  afterEach(() => {
    unsubscribe();
    realtimeClient.disconnect();
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('test_opens_stream_without_token_in_url_and_with_credentials', () => {
    unsubscribe = realtimeClient.subscribe('order.status_changed', () => undefined);

    const [stream] = FakeEventSource.instances;
    expect(stream.url).not.toContain('token');
    expect(stream.url).not.toContain('token_customer_a');
    expect(stream.init).toEqual({ withCredentials: true });
  });

  it('test_reopens_stream_when_another_account_signs_in', () => {
    unsubscribe = realtimeClient.subscribe('order.status_changed', () => undefined);
    const first = FakeEventSource.instances[FakeEventSource.instances.length - 1];

    apiClient.setToken('token_customer_b');

    const latest = FakeEventSource.instances[FakeEventSource.instances.length - 1];
    expect(first.closed).toBe(true);
    expect(latest).not.toBe(first);
    expect(latest.closed).toBe(false);
  });

  it('test_closes_stream_on_sign_out', () => {
    unsubscribe = realtimeClient.subscribe('order.status_changed', () => undefined);
    const stream = FakeEventSource.instances[FakeEventSource.instances.length - 1];
    const createdBefore = FakeEventSource.instances.length;

    apiClient.clearToken();

    expect(stream.closed).toBe(true);
    expect(FakeEventSource.instances).toHaveLength(createdBefore);
  });

  it('test_reopens_stream_when_session_changes_in_another_tab', () => {
    unsubscribe = realtimeClient.subscribe('order.status_changed', () => undefined);
    const first = FakeEventSource.instances[FakeEventSource.instances.length - 1];

    localStorage.setItem('auth_token', 'token_admin');
    window.dispatchEvent(new StorageEvent('storage', { key: 'auth_token' }));

    expect(first.closed).toBe(true);
    expect(FakeEventSource.instances[FakeEventSource.instances.length - 1].closed).toBe(false);
  });
});
