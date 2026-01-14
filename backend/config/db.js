const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI =
    process.env.MONGO_URI || 'mongodb://localhost:27017/nutrilens';
  await mongoose.connect(mongoURI);
  console.log('MongoDB connected successfully');
};

module.exports = connectDB;
