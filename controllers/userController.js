const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const upload = require('../middlewares/uploadProfilePhoto');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../utils/sendEmail');

// CREATE USER
exports.createUser = [
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({
            message: 'Username, Email, and Password are required',
            status: 0,
          });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      const userData = newUser.toObject();
      delete userData.password;

      res
        .status(201)
        .json({ message: 'User created', status: 1, data: userData });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  },
];

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password required', status: 0 });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found', status: 0 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: 'Invalid credentials', status: 0 });

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
      if (!user)
        return res.status(404).json({ message: 'User not found', status: 0 });

      const updateData = req.body;

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      if (req.file) {
        if (user.profile_image) {
          const oldPath = path.join(__dirname, '../public', user.profile_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.profile_image = path.join(
          'uploads',
          'user_photo',
          req.file.filename,
        );
      }

      updateData.updated_at = new Date();

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select('-password');
      res.json({ message: 'User updated', status: 1, data: updatedUser });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  },
];

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user)
      return res.status(404).json({ message: 'User not found', status: 0 });

    res.json({ message: 'User found', status: 1, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};


// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found', status: 0 });
    }

    res.json({ message: 'Users retrieved successfully', status: 1, data: users });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};


//forget
exports.forgotPassword = async (req, res) => {
  console.log(req.body);
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required', status: 0 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 0 });
    }

    // Generate strong random password
    const newPassword = generateStrongPassword();

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in database
    user.password = hashedPassword;
    await user.save();

    // Send email with new password
    const emailBody = `
      <h2>Password Reset</h2>
      <p>Your password has been reset. Here is your new password:</p>
      <p><strong>${newPassword}</strong></p>
      <p>Please login with this password.</p>
      <p>If you didn't request this change, please contact our support team immediately.</p>
    `;

    await sendEmail(email, 'A4-CELEBRATION - Password Reset', emailBody);

    res.json({
      message:
        'Password reset successful. Check your email for the new password.',
      status: 1,
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res
      .status(500)
      .json({ message: 'Server error during password reset', status: 0 });
  }
};

// Helper function to generate strong password
function generateStrongPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specials = '!@#%&*';

  // Ensure at least one character from each set
  let password = [
    lowercase.charAt(Math.floor(Math.random() * lowercase.length)),
    uppercase.charAt(Math.floor(Math.random() * uppercase.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    specials.charAt(Math.floor(Math.random() * specials.length)),
  ];

  // Fill remaining characters randomly
  const allChars = lowercase + uppercase + numbers + specials;
  for (let i = 0; i < 4; i++) {
    password.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  // Shuffle the array and join to form password
  return password.sort(() => Math.random() - 0.5).join('');
}


// UPDATE USER STATUS (Active/Inactive)
// UPDATE USER STATUS (Active/Inactive)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    
      
    

    const user = await User.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found', 
        status: 0 
      });
    }

    res.json({ 
      message: 'User status updated successfully', 
      status: 1, 
      data: user 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message, 
      status: 0 
    });
  }
};


// DELETE USER BY ID
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found', 
        status: 0 
      });
    }

    // Delete profile image if exists
    if (user.profile_image) {
      const imagePath = path.join(__dirname, '../public', user.profile_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ 
      message: 'User deleted successfully', 
      status: 1 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message, 
      status: 0 
    });
  }
};