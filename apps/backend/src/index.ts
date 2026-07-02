import Fastify from 'fastify';
import { parseEnv } from './env.js';
import { HealthResponse } from '@sports-drive/shared-types';

const env = parseEnv();

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Health check endpoint
fastify.get<{ Reply: HealthResponse }>('/health', async (_request, _reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    console.log(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
