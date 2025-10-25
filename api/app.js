// app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { logger } from './middlewares/loggerMiddleware.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(logger);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
