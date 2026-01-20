require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./utils/logger');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'MONGO_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Upload rate limit exceeded'
});

// CORS configuration
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure directories exist
const createDir = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  } catch (error) {
    logger.error(`Failed to create directory ${dir}:`, error);
    process.exit(1);
  }
};

createDir(path.join(__dirname, 'uploads'));
createDir(path.join(__dirname, 'logs'));

// Routes
const analyzeRoutes = require('./routes/analyze');
app.use('/api', uploadLimiter, analyzeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'NutriLens Backend is running', status: 'healthy' });
});

// Global Error Handler
app.use((err, req, res, _next) => {
  const errorId = Date.now().toString();
  
  logger.error('Request error:', {
    errorId,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        errorId 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error',
      errorId 
    });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({ 
      error: err.message,
      errorId 
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      errorId 
    });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    errorId 
  });
});

// Database Connection and Server Start
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();