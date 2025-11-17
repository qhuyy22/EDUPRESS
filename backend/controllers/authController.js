/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const User = require('../models/userModel');

const otpGenerator = require('otp-generator');
const SendMailForgotPassword = require('../utils/emailForgotPassword');

const OTP = require('../models/otpModel');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Validate input
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create user (password will be hashed by pre-save middleware)
  const user = await User.create({
    fullName,
    email,
    password,
    role: 'customer', // Default role
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'User registered successfully',
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    // Check if account is active
    if (user.status === 'inactive') {
      res.status(403);
      throw new Error('Account is inactive. Please contact support.');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        status: user.status,
        token: generateToken(user._id),
      },
      message: 'Login successful',
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

    // Only update email if provided and different
    if (req.body.email && req.body.email !== user.email) {
      // Check if new email already exists
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('Email already in use');
      }
      user.email = req.body.email;
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        status: updatedUser.status,
      },
      message: 'Profile updated successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const findUser = await User.findOne({ email });

  if (!findUser) {
    throw new Error('Email không tồn tại');
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const tokenForgotPassword = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  res.cookie('tokenForgotPassword', tokenForgotPassword, {
    httpOnly: false,
    secure: true,
    maxAge: 5 * 60 * 1000, // 5 minutes
    sameSite: 'strict',
  });

  await OTP.create({
    otp,
    email,
  });
  
  await SendMailForgotPassword(email, otp);

  return res.status(200).json({
    success: true,
    message: 'Mã OTP đã được gửi đến email của bạn',
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Vui lòng cung cấp email và OTP.');
    }

    const otpEntry = await OTP.findOne({ email, otp });

    if (!otpEntry) {
        res.status(400);
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    // OTP hợp lệ, có thể xóa nó đi
    await OTP.deleteOne({ _id: otpEntry._id });

    res.status(200).json({
        success: true,
        message: 'Xác thực OTP thành công.',
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        res.status(400);
        throw new Error('Vui lòng cung cấp đầy đủ thông tin.');
    }

    // Xác thực OTP một lần nữa để đảm bảo an toàn
    const otpEntry = await OTP.findOne({ email, otp });
    if (!otpEntry) {
        res.status(400);
        throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn.');
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('Không tìm thấy người dùng.');
    }

    user.password = password;
    await user.save();

    // Xóa tất cả OTP của người dùng sau khi đổi mật khẩu thành công
    await OTP.deleteMany({ email });

    res.status(200).json({
        success: true,
        message: 'Đặt lại mật khẩu thành công.',
    });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
};
