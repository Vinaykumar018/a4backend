const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const upload = require('../middlewares/uploadProfilePhoto');
const path = require('path');
const fs = require('fs');

// CREATE USER
exports.createUser = [
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, Email, and Password are required', status: 0 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });

      await newUser.save();

      const userData = newUser.toObject();
      delete userData.password;

      res.status(201).json({ message: 'User created', status: 1, data: userData });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required', status: 0 });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found', status: 0 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials', status: 0 });

    const userData = user.toObject();
    delete userData.password;

    res.json({ message: 'Login successful', status: 1, data: userData });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// UPDATE USER
exports.updateUser = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ message: 'User not found', status: 0 });

      const updateData = req.body;

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      if (req.file) {
        if (user.profile_image) {
          const oldPath = path.join(__dirname, '../public', user.profile_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.profile_image = path.join('uploads', 'user_photo', req.file.filename);
      }

      updateData.updated_at = new Date();

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      res.json({ message: 'User updated', status: 1, data: updatedUser });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found', status: 0 });

    res.json({ message: 'User found', status: 1, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};
