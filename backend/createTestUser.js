const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nutrilens');

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@nutrilens.com' });
    
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@nutrilens.com');
      console.log('Password: test123456');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123456', 10);
    
    const testUser = await User.create({
      userName: 'Test User',
      email: 'test@nutrilens.com',
      password: hashedPassword,
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@nutrilens.com');
    console.log('🔑 Password: test123456');
    console.log('👤 Username: Test User');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();