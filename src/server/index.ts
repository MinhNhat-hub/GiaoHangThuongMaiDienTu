import http from 'node:http';
import { handleApiRequest } from './router';

export function createHttpServer(): http.Server {
  return http.createServer((req, res) => {
    handleApiRequest(req, res).catch((err) => {
      console.error('Unhandled server exception:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal error' } }));
      }
    });
  });
}

export function startServer(port = 3000): Promise<http.Server> {
  const server = createHttpServer();
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Backend API Server running at http://localhost:${port}/api/v1`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

export function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Auto-start when executed directly via vite-node or node
if (process.argv[1]?.includes('server') || process.env.RUN_STANDALONE === 'true') {
  const port = parseInt(process.env.PORT || '3000', 10);
  startServer(port).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
