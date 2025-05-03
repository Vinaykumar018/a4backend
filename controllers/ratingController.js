const Rating = require('../model/ratingModel');


// CREATE RATING
exports.createRating = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment, isWishlisted } = req.body;

    if (!user_id || !product_id || !rating) {
      return res.status(400).json({ message: 'User ID, Product ID, and Rating are required', status: 0 });
    }

    const newRating = new Rating({
      user_id,
      product_id,
      rating,
      comment,
      isWishlisted
    });

    await newRating.save();

    res.status(200).json({ message: 'Rating added successfully', status: 1, data: newRating });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// UPDATE RATING
exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, isWishlisted } = req.body;

    const existingRating = await Rating.findById(id);
    if (!existingRating) return res.status(404).json({ message: 'Rating not found', status: 0 });

    // Update the rating
    existingRating.rating = rating || existingRating.rating;
    existingRating.comment = comment || existingRating.comment;
    existingRating.isWishlisted = isWishlisted !== undefined ? isWishlisted : existingRating.isWishlisted;

    await existingRating.save();

    res.json({ message: 'Rating updated successfully', status: 1, data: existingRating });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET RATING BY ID
exports.getRatingById = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findById(id);
    if (!rating) return res.status(404).json({ message: 'Rating not found', status: 0 });

    res.json({ message: 'Rating found', status: 1, data: rating });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE RATING
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findByIdAndDelete(id);
    if (!rating) return res.status(404).json({ message: 'Rating not found', status: 0 });

    res.json({ message: 'Rating deleted successfully', status: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL RATINGS FOR A PRODUCT
exports.getAllRatingsForProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const ratings = await Rating.find({ product_id: product_id });

    // Calculate the average rating on-the-fly (when fetching ratings)
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    res.json({ 
      message: 'Ratings retrieved successfully', 
      status: 1, 
      data: ratings,
      averageRating 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};
