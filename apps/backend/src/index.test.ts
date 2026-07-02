import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { HealthResponse } from '@sports-drive/shared-types';

describe('Health Endpoint', () => {
  let fastify = Fastify();

  beforeAll(async () => {
    fastify.get<{ Reply: HealthResponse }>('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return 200 with health status', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as HealthResponse;
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeGreaterThan(0);
  });
});
