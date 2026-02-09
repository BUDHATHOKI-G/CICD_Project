
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (_, res) => res.send('API is running...'));

export default app;





// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import authRoutes from './routes/authRoutes';
// import { httpRequestCounter, register } from './metrics';

// dotenv.config();

// const app = express();

// /* ===================== CORS ===================== */
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// /* ===================== BODY PARSER ===================== */
// app.use(express.json());

// /* ===================== REQUEST METRICS ===================== */
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.on('finish', () => {
//     httpRequestCounter.inc({
//       method: req.method,
//       route: req.route?.path || req.path,
//       status: res.statusCode.toString(),
//     });
//   });
//   next();
// });

// /* ===================== ROUTES ===================== */
// app.use('/api/auth', authRoutes);

// /* ===================== HEALTH CHECK ===================== */
// app.get('/health', (_req: Request, res: Response) => {
//   res.send('API is running...');
// });

// /* ===================== PROMETHEUS METRICS ===================== */
// app.get('/metrics', async (_req: Request, res: Response) => {
//   try {
//     res.setHeader('Content-Type', register.contentType);
//     res.end(await register.metrics());
//   } catch (err) {
//     res.status(500).send('Could not collect metrics');
//   }
// });

// export default app;


