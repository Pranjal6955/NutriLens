const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long',
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
    });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to NutriLens - Let's get started!",
        text: `Hi ${userName},

            Welcome to NutriLens!

            Your account has been successfully created. You can now start using NutriLens.

            If you did not create this account, please contact our support team.

            Thanks,
                The NutriLens Team`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c7be5;">Welcome to NutriLens!</h2>

        <p>Hi <strong>${userName}</strong>,</p>

        <p>
            We're excited to have you on board! Your NutriLens account has been
            successfully created.
        </p>

        <p>
            You can now explore the platform and start using NutriLens features.
        </p>

        <p style="margin-top: 20px;">
            If you didn't create this account or need any help, feel free to reach
            out to our support team.
        </p>

        <p style="margin-top: 30px;">
            Cheers,<br />
            <strong>The NutriLens Team</strong>
        </p>

        <hr style="margin-top: 40px;" />

        <p style="font-size: 12px; color: #777;">
            This is an automated message. Please do not reply to this email.
        </p>
        </div>
    `,
      });
    } catch (emailErr) {
      logger.warn('Welcome email failed:', emailErr.message);
    }

    logger.info(`New user registered: ${email}`);

    return res.status(201).json({
      message: 'Registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        userName: newUser.userName,
      },
    });
  } catch (err) {
    logger.error('Registration error:', err);
    return res.status(500).json({
      message: 'Registration failed. Please try again later.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
      },
    });
  } catch (err) {
    logger.error('Login error:', err);
    return res.status(500).json({
      message: 'Login failed. Please try again later.',
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.json({ message: 'Logout successful' });
};

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userName: name || email.split('@')[0],
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
        isGoogleUser: true,
        avatar: picture,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '1h',
      }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      message: 'Google authentication successful',
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    logger.error('Google auth error:', err);
    return res.status(500).json({
      message: 'Google authentication failed. Please try again later.',
    });
  }
};
