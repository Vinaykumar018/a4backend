const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: String,
  
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);




const Wishlist = mongoose.model("Wishlist", WishlistSchema);

module.exports = Wishlist;
