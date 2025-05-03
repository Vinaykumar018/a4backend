const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String ,unique: true, sparse: true  },
  password: { type: String }, // Optional for social login

  role: {
    type: String,
    enum: ['customer', 'artist', 'decorator', 'caterer', 'admin'],
    default: 'customer'
  },

  social_type: {
    type: String,
    enum: ['google', 'facebook', 'other'],
    default: null
  },

  profile_image: { type: String, default: null },

  address: { type: String },
  city: { type: String },
  country: { type: String },
  pincode: { type: String },
  landmark: { type: String },

  fcm_token: { type: String, default: null },

  gender: { type: String, enum: ['male', 'female', 'other'] },

  is_verified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  isDeleted: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
