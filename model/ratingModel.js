const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Assuming you're using a User model for storing user details
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Refers to the Product model
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 0
  },
  comment: {
    type: String,
    required: false,
    trim: true
  },
  isWishlisted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
