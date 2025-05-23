// controllers/UserController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

// Helper function to format user data for response (excluding sensitive info)
const formatUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    // Generate token for the newly registered user
    const token = generateToken(user);
    
    // Log successful registration
    console.log(`User registered successfully: ${email} with role ${role}`);
    
    // Return user data along with the token
    res.status(201).json({ 
      token, 
      user: formatUserResponse(user), 
      message: 'User registered successfully' 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      // Use a generic error message for security
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`Login failed: Invalid password for user - ${email}`);
      // Use a generic error message for security
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);
    
    // Log successful login
    console.log(`User logged in successfully: ${email} with role ${user.role}`);
    
    // Return user data along with the token
    res.json({ 
      token, 
      user: formatUserResponse(user),
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Only return necessary fields, exclude sensitive information
    const users = await User.find().select('_id name email role createdAt');
    res.json(users);
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Validate ID format to prevent unnecessary DB queries
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId).select('_id name email role createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(`Error fetching user by ID ${req.params.id}:`, err);
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // The user object should be available from the auth middleware
    // We can directly use req.user instead of making another DB query
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Return the user data
    res.json(formatUserResponse(req.user));
  } catch (err) {
    console.error('Error getting current user:', err);
    res.status(500).json({ message: 'Error fetching current user', error: err.message });
  }
};
