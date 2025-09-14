import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Log environment variables loading
console.log('🔍 Environment variables loaded:');
console.log('   KNOT_API_KEY:', process.env.KNOT_API_KEY ? '✅ Found' : '❌ Missing');
console.log('   KNOT_ENVIRONMENT:', process.env.KNOT_ENVIRONMENT || 'development');
console.log('   PORT:', process.env.PORT || 3001);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import knotRoutes from './routes/knot.js';
import transactionRoutes from './routes/transactions.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ecotrack-backend',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/knot', knotRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🌱 EcoTrack Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Knot API endpoint: http://localhost:${PORT}/api/knot/session`);
  console.log(`📈 Environment: ${process.env.NODE_ENV || 'development'}`);
});