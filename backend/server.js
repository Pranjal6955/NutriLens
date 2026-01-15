require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      console.error(
        `CORS Blocked Origin: ${origin}. Allowed Origins: ${JSON.stringify(allowedOrigins)}`
      );
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
const analyzeRoutes = require('./routes/analyze');
app.use('/api', analyzeRoutes);

app.get('/', (req, res) => {
  res.send('NutriLens Backend is running');
});

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ error: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (
    err.message ===
    'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
  ) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Database Connection and Server Start
const connectDB = require('./config/db');

const startServer = async () => {
  try {
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
