const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
  category_image: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  slug_url: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: 1,
  },
  child_category: {
    type: Map,
    of: new mongoose.Schema({
      name: String,
      image: String
    }, { _id: false }),
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("a4-category", CategorySchema);