const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    order_id: { type: String, required: true, unique: true },

    // User Details
    userDetails: {
      userId: { type: String, required: true },
      username: { type: String, required: true },
      contactNumber: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Address Details
    addressDetails: {
      home_address: { type: String, required: true },
      street_address: { type: String, required: true },
      city_address: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // Product Details (array of products)
    productDetails: [
      {
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        amount: { type: Number, required: true },
        quantity: { type: Number, required: true },
        service_date: { type: String }, // Added for product-specific service date
        service_time: { type: String }, // Added for product-specific service time
      },
    ],

    // Payment Details
    paymentDetails: {
      totalAmount: { type: Number, required: true },
      transactionId: { type: String, default: null },
      transactionStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'failed', 'refunded'],
      },
      transactionDate: { type: Date, default: null },
      paymentMethodType: { type: String, required: true },
    },

    // Order Details
    orderDetails: {
      order_status: {
        type: String,
        default: 'pending',
        enum: [
          'pending',
          'processing',
          'confirmed',
          'shipped',
          'delivered',
          'cancelled',
        ],
      },
      order_requested_date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0],
      },
      order_requested_time: {
        type: String,
        default: () => new Date().toTimeString().split(' ')[0],
      },
      products: [
        {
          productId: { type: String, required: true },
          quantity: { type: Number, required: true },

          order_requested_date: {
            // Added product-specific date
            type: String,
            default: null,
          },
          order_requested_time: {
            // Added product-specific time
            type: String,
            default: null,
          },
          lastUpdated: { type: Date, default: Date.now }, // Added for tracking updates
        },
      ],
      lastUpdated: { type: Date, default: Date.now },
    },

    // Optional Fields
    deliveryNotes: { type: String },
    discountApplied: { type: Number, default: 0 },
    shippingMethod: { type: String },
  },
  { timestamps: true },
);

// Model
const Order = mongoose.model('a4-orders', orderSchema);

module.exports = Order;
