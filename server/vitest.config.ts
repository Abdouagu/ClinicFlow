import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      PORT: '5001',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/clinicflow_test',
      DATABASE_URL_DIRECT: 'postgresql://postgres:postgres@localhost:5432/clinicflow_test',
      JWT_SECRET: 'test-jwt-secret-key-at-least-32-characters-long-for-clinicflow-auth',
      JWT_EXPIRES_IN: '8h',
      ARCJET_KEY: 'test_arcjet_key',
      CLIENT_ORIGIN: 'http://localhost:5173',
      CLINIC_TIMEZONE: 'Africa/Casablanca',
    },
  },
});
