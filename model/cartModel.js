const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId, // or String if you're not using ObjectId
    ref: 'User',
    required: true,
  },
  items: [
    {
      product_id: String, // Product ID (custom or from another collection)
      product_name: String, // Name of the product
      // Slug for URL
      // Price
      quantity: Number,
      pinCode: String,
      service_date: String, // e.g., "2025-05-10"
      service_time: String, // e.g., "10:00 AM - 1:00 PM"
      // Full URL or path to product image
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` automatically
cartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
