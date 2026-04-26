require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests from this IP.' },
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://aurora-frontend-asmy.onrender.com'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

// Remove X-Powered-By header
app.disable('x-powered-by');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Aurora Dental Care API', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
});

// Start server
const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🦷 Aurora Dental Care API running on port ${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
