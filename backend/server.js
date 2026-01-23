require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

const authRoutes = require('./routes/authRoutes');

// Validate required environment variables unless running in DEV_MOCK mode
if (process.env.DEV_MOCK !== 'true') {
  const requiredEnvVars = ['GEMINI_API_KEY', 'MONGO_URI', 'JWT_SECRET'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
} else {
  console.log('DEV_MOCK mode active: skipping external service env var checks');
}

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
app.use(limiter);

// Stricter rate limit for upload endpoint
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 uploads per 15 minutes
  message: 'Upload rate limit exceeded',
});

// CORS configuration
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

// In DEV_MOCK mode, allow localhost origins for local development
if (process.env.DEV_MOCK === 'true') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173');
  console.log('DEV_MOCK: Allowing local origins for CORS');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
} catch (error) {
  console.error('Failed to create uploads directory:', error.message);
  process.exit(1);
}

// Routes: use mock routes when DEV_MOCK=true for local QA without external services
if (process.env.DEV_MOCK === 'true') {
  console.log('DEV_MOCK is enabled — mounting mock analysis routes');
  const mockRoutes = require('./routes/mockAnalyze');
  app.use('/api', mockRoutes);
} else {
  const analyzeRoutes = require('./routes/analyze');
  app.use('/api', uploadLimiter, analyzeRoutes);
}

app.get('/', (req, res) => {
  res.send('NutriLens Backend is running');
});

// Global Error Handler
app.use((err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }

  if (err.message === 'Invalid file type') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Database Connection and Server Start
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    if (process.env.DEV_MOCK === 'true') {
      // Skip DB connection in dev mock mode
      app.listen(PORT, () => {
        console.log(`Server running in DEV_MOCK mode on port ${PORT}`);
      });
      return;
    }

    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      'Failed to start server due to DB connection error:',
      error.message
    );
    process.exit(1);
  }
};

startServer();
