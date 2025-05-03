const mongoose = require('mongoose');

const decorationSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  slug_url: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  short_description: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  category_name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  stock_left: {
    type: Number,
    required: true
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  featured_image: {
    type: String,
    required: true
  },
  other_images: {
    type: [String],
    default: []
  },
  child_categories: {
    type: [{
      id: String,
      name: String
    }],
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('a4-decorations', decorationSchema);
