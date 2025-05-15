const Order = require('../model/decorationOrderSchema') // Your schema file


// Create New Order
exports.createDecorationOrder = async (req, res) => {
  try {
    // Generate random 6-digit number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const generatedOrderId = `ORDER${randomSuffix}`;

    // Attach generated order_id to the request body
    const orderData = {
      ...req.body,
      order_id: generatedOrderId
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      status: 'success',
      data: savedOrder
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};


// Get All Orders
exports.getAllDecorationOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get Single Order
exports.getDecorationOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ order_id: req.params.id });
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};


// Update Order Status
exports.updateDecorationOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 'orderDetails.order_status': req.body.status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete Order
exports.cancelDecorationOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        'orderDetails.order_status': 'cancelled',
        'orderDetails.cancellationDate': Date.now(),
        'orderDetails.cancellationReason': cancellationReason
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};