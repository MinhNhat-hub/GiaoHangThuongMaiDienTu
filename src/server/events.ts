import type { ServerResponse } from 'node:http';
import type { UserProfile } from '@/types/api';

export interface SseClient {
  id: string;
  res: ServerResponse;
  user?: UserProfile;
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

    // Initial connection comment to establish stream immediately
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

  // Dispatches an event to all connected clients that have permission to view it
  broadcast(eventName: string, payload: unknown, targetUserId?: string): void {
    const rawData = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;

    for (const client of this.clients) {
      if (client.res.writableEnded) {
        this.clients.delete(client);
        continue;
      }

      // If event is scoped to a specific customer or shipper, skip other non-admin users
      if (targetUserId && client.user) {
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

  // Closes all client connections (used when resetting or stopping server)
  closeAll(): void {
    for (const client of this.clients) {
      try {
        client.res.end();
      } catch {
        // Ignore close errors
      }
    }
    this.clients.clear();
  }
}

export const sseManager = new SseEventManager();
