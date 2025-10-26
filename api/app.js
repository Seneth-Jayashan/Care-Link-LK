import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes.js';
import { logger } from './middlewares/loggerMiddleware.js';

// --- Import your new custom error classes ---
import { NotFoundError, ForbiddenError, BadRequestError } from './utils/errorResponse.js';

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

// --- Custom Error Handler Middleware ---
// This replaces your old 'notFound' and 'errorHandler'
// It MUST be the last middleware added
app.use((err, req, res, next) => {
  // Log the error for debugging
  console.error(err.stack);

  // Check for our custom errors
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(err.statusCode).json({ message: err.message });
s   }
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json({ message });
  }

  // Handle Mongoose CastErrors (e.g., bad ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({ message: `Resource not found` });
  }

  // Default to 500 Internal Server Error
  return res.status(500).json({ 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

export default app;