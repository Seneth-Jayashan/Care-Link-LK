import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { logger } from './middlewares/loggerMiddleware.js';
import cors from 'cors';
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middleware: CORS
app.use(
  cors({
    origin: 'http://localhost:5173', // your React frontend
    credentials: true, // allow cookies / Authorization headers
  })
);

app.use(express.json());
app.use(logger);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use('/api/v1', routes);

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
