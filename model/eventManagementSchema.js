const mongoose = require('mongoose');

const eventManagementSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug_url: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    category_name: {
      type: String,
    },

    // Wedding-specific fields
    price: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    category_name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    food_type: {
      type: String,
      required: true, // Example: 'Veg', 'Non-Veg', 'Both'
    },
    pax: {
      type: Number,
      required: true, // Number of guests
    },
    room: {
      type: String,
      required: true, // Example: '10 AC Rooms'
    },
    city: {
      type: String,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    featured_image: {
      // Changed from venue_featured_image
      type: String,
      required: true,
    },
    other_images: {
      // Changed from venue_other_images
      type: [String],
      default: [],
    },
    package_by: {
      type: String, // Organizer or vendor name
    },
    offer_ends_in: {
      type: String, // Example: '5 days', '30 Sep'
    },
    whatsapp: {
      type: String, // Phone number or link
    },
    package_details: {
      type: String,
        required: true
    },
    day_plans: {
      day1: String,
      day2: String,
    },
    package_includes: {
     
      catering: { type: Boolean, default: false },
      decoration: { type: Boolean, default: false },
      dj: { type: Boolean, default: false },
      entry_theme: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    child_categories: {
      type: [
        {
          id: String,
          name: String,
        },
      ],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  'a4-event-management',
  eventManagementSchema,
);
