import client from 'prom-client';

/* ===================== DEFAULT METRICS ===================== */
client.collectDefaultMetrics();

/* ===================== CUSTOM METRICS ===================== */
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

/* ===================== REGISTER ===================== */
export const register = client.register;
