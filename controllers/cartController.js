const Cart = require('../model/cartModel');
const mongoose = require('mongoose');

// @desc    Get user's cart
// @route   GET /api/cart/:userId
// @access  Private
const getCart = async (req, res) => {
  try {

    const { userID } = req.params
  let cart = await Cart.findOne({ userID });;
    
    console.log("cart",cart)
    if (!cart) {
      return res.status(200).json({ 
        userID: req.params.userId, 
        items: [] 
      });
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/:userId
// @access  Private
const addItem = async (req, res) => {
  console.log(req.body)
  try {
    // Destructure data from req.body
    const { userID, items } = req.body;
  

    // Validate that 'items' is an array and not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Ensure that each item has the required fields
    for (let item of items) {
      const { product_id, product_name, quantity, pinCode, service_date, service_time } = item;

      if (!product_id || !product_name ) {
        return res.status(400).json({
          message: 'Missing required fields for one or more items',
        });
      }
    }

    let cart = await Cart.findOne({ userID });

    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        userID,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          pinCode: item.pinCode,
          service_date: item.service_date,
          service_time: item.service_time,
        })),
      });
    } else {
      // Check each item in the cart
      for (let item of items) {
        const { product_id, product_name, quantity, pinCode, service_date, service_time } = item;

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
          (cartItem) => cartItem.product_id === product_id
        );

        if (existingItemIndex >= 0) {
          // Update quantity if exists
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item if it doesn't exist
          cart.items.push({
            product_id,
            product_name,
            quantity,
            pinCode,
            service_date,
            service_time,
          });
        }
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};


// @desc    Update cart item
// @route   PUT /api/cart/:userId/:itemId
// @access  Private
const updateItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const updates = req.body;

    const cart = await Cart.findOneAndUpdate(
      { 
        userID: userId, 
        'items.product_id': productId // Changed to search by product_id
      },
      { 
        $set: {
          'items.$.product_name': updates.product_name,
          'items.$.quantity': updates.quantity,
          'items.$.pinCode': updates.pinCode,
          'items.$.service_date': updates.service_date,
          'items.$.service_time': updates.service_time
        } 
      },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ 
        message: 'Cart or item not found' 
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
// @desc    Remove item from cart
// @route   DELETE /api/cart/:userId/:itemId
// @access  Private
const removeItem = async (req, res) => {
  try {
    const { userID } = req.params;
    const { productId } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { userID },
      { $pull: { items: { product_id: productId } } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/:userId
// @access  Private
const clearCart = async (req, res) => {
  try {
    const {userID  } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { userID  },
      { $set: { items: [] } },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ 
        message: 'Cart not found' 
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};