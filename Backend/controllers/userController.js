// controllers/UserController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    console.log(user);  
    await user.save();
    
    // Generate token for the newly registered user
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Return user data along with the token
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(201).json({ token, user: userData, message: 'User registered successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Return user data along with the token (excluding the password)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.json({ token, user: userData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

<<<<<<< HEAD

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

=======
export const getCurrentUser = async (req, res) => {
  try {
    // The user ID should be available from the authentication middleware
    const userId = req.user.id;
    
    // Find the user by ID and exclude the password field
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return the user data
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
>>>>>>> 2b6844ffb6702a912e5a64a623ad5d08937365f5
