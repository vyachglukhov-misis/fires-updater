import request from 'supertest';
import { describe, expect, test } from 'vitest';
import { buildApp } from '~/app.js';

const TEST_ROUTES = {
  healthCheck: '/api/health-check',
};

describe(TEST_ROUTES.healthCheck, () => {
  test('дано: Get запрос, ожидается возврат статуса 200 с сообщением, отметкой времени и временем работы', async () => {
    const app = buildApp();

    const actual = await request(app).get(TEST_ROUTES.healthCheck).expect(200);
    const expected = {
      message: 'OK',
      timestamp: expect.any(Number),
      uptime: expect.any(Number),
    };
    expect(actual.body).toEqual(expected);
  });
});
