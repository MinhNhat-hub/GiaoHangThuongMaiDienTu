import type { ServerResponse } from 'node:http';
import type { UserProfile } from '@/types/api';

export interface SseClient {
  id: string;
  res: ServerResponse;
  user?: UserProfile;
}

export interface BroadcastOptions {
  targetUserId?: string;
  adminOnly?: boolean;
}

class SseEventManager {
  private clients: Set<SseClient> = new Set();

  // Registers a new Server-Sent Events client connection
  addClient(res: ServerResponse, user?: UserProfile): SseClient {
    const client: SseClient = {
      id: `sse_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      res,
      user,
    };
    this.clients.add(client);

    res.write(': connected\n\n');

    res.on('close', () => {
      this.clients.delete(client);
    });

    return client;
  }

  // Removes a client from active subscribers
  removeClient(client: SseClient): void {
    this.clients.delete(client);
  }

  // Number of active SSE connections
  getClientCount(): number {
    return this.clients.size;
  }

  // Dispatches an event to targeted user, role, or broadcasts to subscribers
  broadcast(
    eventName: string,
    payload: unknown,
    options?: BroadcastOptions | string
  ): void {
    const targetUserId = typeof options === 'string' ? options : options?.targetUserId;
    const adminOnly = typeof options === 'object' ? Boolean(options?.adminOnly) : false;
    const rawData = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      if (client.res.writableEnded) {
        this.clients.delete(client);
        continue;
      }

      if (adminOnly) {
        if (client.user?.role !== 'Admin') {
          continue;
        }
      } else if (targetUserId && client.user) {
        if (client.user.role !== 'Admin' && client.user.id !== targetUserId) {
          continue;
        }
      }

      try {
        client.res.write(rawData);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  // Closes all client connections
  closeAll(): void {
    for (const client of this.clients) {
      try {
        client.res.end();
      } catch {
        void 0;
      }
    }
    this.clients.clear();
  }
}

export const sseManager = new SseEventManager();
