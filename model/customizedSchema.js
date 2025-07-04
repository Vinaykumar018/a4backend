const mongoose = require('mongoose');

const customizedSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      ref: 'a4-event-management'
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    phone_number: {
      type: String
    },
    name: {
      type: String
    },
    email: {
      type: String
    },
    event_date: {
      type: Date
    },
    guest_count: {
      type: Number
    },
    food_preference: {
      type: String
    },
    budget_range: {
      type: String
    },
    special_requirements: {
      type: String
    },
    package_customizations: {
      catering: { type: Boolean, default: false },
      decoration: { type: Boolean, default: false },
      photography: { type: Boolean, default: false },
      venue: { type: Boolean, default: false }
    },
    status: {
      type: String,
      default: 'pending'
    },
    admin_notes: {
      type: String
    },
    quoted_price: {
      type: Number
    },
    final_price: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('a4-customized-requests', customizedSchema);
