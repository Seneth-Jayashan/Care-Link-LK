import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { logger } from './middlewares/loggerMiddleware.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/v1', routes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
