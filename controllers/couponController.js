// controllers/couponController.js
const Coupon = require('../model/couponModel')

// 1. Create Coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;
    
    // Basic validation
    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newCoupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      expiryDate,
      isActive: true,
      usageLimit: req.body.usageLimit || 100,
      usedCount: 0
    });

    res.status(201).json(newCoupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Get All Coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Apply Coupon
// 3. Apply Coupon
const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon' });
    
    // Validate coupon
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
    if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: 'Coupon expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon limit reached' });

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.json({
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      valid: true,
      message: 'Coupon applied successfully!'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  applyCoupon
};