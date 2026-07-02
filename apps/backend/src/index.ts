import Fastify from 'fastify';
import { HealthResponse } from '@sports-drive/shared-types';

const app = Fastify({
  logger: false,
});

app.get<{ Reply: HealthResponse }>('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.BACKEND_PORT || '3000', 10);
    const host = process.env.BACKEND_HOST || 'localhost';
    await app.listen({ port, host });
    console.log(`Server running on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
