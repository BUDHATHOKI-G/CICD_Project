import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  register,
} from './metrics';

dotenv.config();

const app = express();

/* =====================================================
   1️⃣ PROMETHEUS METRICS (INTERNAL ONLY)
   ===================================================== */
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send('Could not collect metrics');
  }
});

/* =====================================================
   2️⃣ CORS (BROWSER ONLY)
   ===================================================== */
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:30998',  // K8s NodePort / prod frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (Prometheus, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* =====================================================
   3️⃣ BODY PARSER
   ===================================================== */
app.use(express.json());

/* =====================================================
   4️⃣ HTTP REQUEST METRICS (COUNT + LATENCY)
   ===================================================== */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;

    const route = req.route?.path || req.path;
    const status = res.statusCode.toString();

    // Request count
    httpRequestsTotal.labels(req.method, route, status).inc();

    // Request latency
    httpRequestDurationSeconds
      .labels(req.method, route, status)
      .observe(durationSeconds);
  });

  next();
});

/* =====================================================
   5️⃣ API ROUTES
   ===================================================== */
app.use('/api/auth', authRoutes);

/* =====================================================
   6️⃣ HEALTH CHECK
   ===================================================== */
app.get('/health', (_req: Request, res: Response) => {
  res.send('API is running...');
});

export default app;
