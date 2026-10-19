import express from 'express';
import cookieParser from 'cookie-parser';
import { initDb } from './db';
import { apiRouter } from './routes';

// Ensure SQLite database & seed data is initialized
initDb();

export const app = express();

// Parsers and middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Mount API routes at /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    restaurant: 'Pizzaria Prince',
    environment: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
    timestamp: new Date().toISOString(),
  });
});

export default app;
