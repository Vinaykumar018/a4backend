const Wishlist = require("../model/wishListModel");

// Add to Wishlist
exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "User ID and Product ID are required" });
  }

  try {
    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return res.status(409).json({ message: "Item already exists in wishlist" });
    }

    const wishlistItem = await Wishlist.create({ userId, productId });
    res.status(201).json({ message: "Added to wishlist", wishlistItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Wishlist by User ID
exports.getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlist = await Wishlist.find({ userId }); // no populate, since productId is string
    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove item from Wishlist
exports.removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const deleted = await Wishlist.findOneAndDelete({ userId, productId });

    if (!deleted) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
