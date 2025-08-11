const Order = require('../model/decorationOrderSchema');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const validator = require('validator');
const sendEmail = require('../utils/sendEmail');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Delete Order
exports.cancelDecorationOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        'orderDetails.order_status': 'cancelled',
        'orderDetails.cancellationDate': Date.now(),
        'orderDetails.cancellationReason': cancellationReason,
      },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found',
      });
    }

    // Send cancellation email
    const customerEmail = order.userDetails?.email;
    if (customerEmail) {
      const { username, contactNumber } = order.userDetails;
      const { order_requested_date, order_requested_time } = order.orderDetails;
      const productsHTML = order.productDetails
        .map(
          (product) => `
        <tr>
          <td style="padding: 8px 0;">${product.productName}</td>
          <td style="padding: 8px 0;">${product.quantity}</td>
          <td style="padding: 8px 0;">₹${product.amount}</td>
        </tr>
      `,
        )
        .join('');

      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="background-color: #F44336; color: white; padding: 20px; text-align: center;">
            <h2>A4-CELEBRATION - Order Cancelled</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your order <strong>#${
              order.order_id
            }</strong> has been cancelled as per your request.</p>
            ${
              cancellationReason
                ? `<p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>`
                : ''
            }

            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h3>
            <p><strong>Requested Date:</strong> ${order_requested_date} at ${order_requested_time}</p>
            <p><strong>Contact:</strong> ${contactNumber}</p>
            <p><strong>Delivery Address:</strong> ${
              order.addressDetails.home_address
            }</p>

            <h3 style="margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Products</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="text-align: left; background-color: #f5f5f5;">
                  <th style="padding: 8px 0;">Product</th>
                  <th style="padding: 8px 0;">Qty</th>
                  <th style="padding: 8px 0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <h3 style="margin-top: 20px;">Total Amount: ₹${
              order.paymentDetails.totalAmount
            }</h3>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 14px;">
            <p>We're sorry to see you go. Hope to serve you again soon!</p>
            <p style="color: #888;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      `;

      await sendEmail(
        customerEmail,
        'A4-CELEBRATION - Order Cancellation Confirmation',
        emailBody,
      );
      console.log(`Cancellation email sent to ${customerEmail}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Create new order (handles both Razorpay and COD)
exports.createNewOrder = async (req, res) => {
  try {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const generatedOrderId = `ORDER${randomSuffix}`;

    const orderData = {
      ...req.body,
      order_id: generatedOrderId,
      order_status:
        req.body.paymentDetails.paymentMethodType === 'COD'
          ? 'confirmed'
          : 'pending',
    };

    // For Razorpay, create Razorpay order first
    if (req.body.paymentDetails.paymentMethodType === 'razorpay') {
      const razorpayOrder = await razorpay.orders.create({
        amount: orderData.paymentDetails.totalAmount * 100,
        currency: 'INR',
        receipt: generatedOrderId,
      });

      orderData.paymentDetails.razorpayOrderId = razorpayOrder.id;
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    console.log(savedOrder);

    // Send order confirmation email
    // In your createNewOrder function, update the email section like this:
    const customerEmail = savedOrder.userDetails?.email;
    if (customerEmail) {
      const { username, contactNumber, email } = savedOrder.userDetails;
      const { order_status, order_requested_date, order_requested_time } =
        savedOrder.orderDetails;

      // Map products to HTML
      const productsHTML = savedOrder.productDetails
        .map(
          (product) =>
            `<tr>
      <td style="padding: 8px 0;">${product.productName}</td>
      <td style="padding: 8px 0;">${product.quantity}</td>
      <td style="padding: 8px 0;">₹${product.amount}</td>
    </tr>`,
        )
        .join('');

      // Determine payment method and status
      const paymentMethod =
        savedOrder.paymentDetails.paymentMethodType === 'cod'
          ? 'Cash on Delivery (COD)'
          : 'Online Payment (Razorpay)';

      // Format the requested date and time
      const formattedDateTime = `${order_requested_date} at ${order_requested_time}`;

      const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h2>A4-CELEBRATION - Order Confirmation</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thank you for your order <strong>#${
          savedOrder.order_id
        }</strong>!</p>
        <p>Your order is currently <strong>${order_status.toUpperCase()}</strong>.</p>
       

        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h3>
        <p><strong>Order Date:</strong> ${formattedDateTime}</p>
        <p><strong>Contact:</strong> ${contactNumber}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Delivery Address:</strong> ${
          savedOrder.addressDetails.home_address
        }, ${savedOrder.addressDetails.city_address} - ${
        savedOrder.addressDetails.pincode
      }</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        ${
          savedOrder.deliveryNotes
            ? `<p><strong>Delivery Notes:</strong> ${savedOrder.deliveryNotes}</p>`
            : ''
        }

        <h3 style="margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Products</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; background-color: #f5f5f5;">
              <th style="padding: 8px 0;">Product</th>
              <th style="padding: 8px 0;">Qty</th>
              <th style="padding: 8px 0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>

        <h3 style="margin-top: 20px;">Total Amount: ₹${
          savedOrder.paymentDetails.totalAmount
        }</h3>
        
        ${
          savedOrder.discountApplied > 0
            ? `<p style="color: #4CAF50;"><strong>Discount Applied:</strong> ₹${savedOrder.discountApplied}</p>`
            : ''
        }
      </div>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 14px;">
        <p>Thanks for choosing A4-CELEBRATION! ❤️</p>
        <p style="color: #888;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;

      // Determine email subject based on payment status
      const emailSubject =
        savedOrder.paymentDetails.transactionStatus === 'pending'
          ? 'A4-CELEBRATION - Order Received (Payment Pending)'
          : 'A4-CELEBRATION - Order Confirmation';

      await sendEmail(customerEmail, emailSubject, emailBody);
      console.log(`Order confirmation email sent to ${customerEmail}`);
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: savedOrder,
        razorpayOrderId: orderData.paymentDetails.razorpayOrderId || null,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature, razorpayOrderId } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${payment_id}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid payment signature',
      });
    }

    // Update order status
    const updatedOrder = await Order.findOneAndUpdate(
      { order_id },
      {
        'paymentDetails.transactionId': payment_id,
        'paymentDetails.transactionStatus': 'completed',
        'paymentDetails.transactionDate': new Date(),
        order_status: 'confirmed',
      },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get All Orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(orders)
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// Get Single Order
exports.getOrderByID = async (req, res) => {
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

// Update Order St
//atus
// adjust path if needed

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid order ID format',
      });
    }

    // Validate status field
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Status is required',
      });
    }

    // Allow only valid statuses
    const validStatuses = [
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Update the order status
    const order = await Order.findByIdAndUpdate(
      id,
      { 'orderDetails.order_status': status },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found',
      });
    }

    const paymentMethod = order.paymentDetails.paymentMethodType;
    const txnStatus = order.paymentDetails.transactionStatus;

    // ✅ COD logic: auto sync based on delivery status
    if (paymentMethod === 'cod') {
      if (status === 'delivered' && txnStatus !== 'completed') {
        order.paymentDetails.transactionStatus = 'completed';
        order.paymentDetails.transactionDate = new Date();
        await order.save();
      }

      if (status !== 'delivered' && txnStatus === 'completed') {
        order.paymentDetails.transactionStatus = 'pending';
        order.paymentDetails.transactionDate = null;
        await order.save();
      }
    }

    // ✅ Razorpay logic: auto sync based on cancel/delivery recovery
    if (paymentMethod === 'razorpay') {
      if (status === 'cancelled' && txnStatus === 'completed') {
        order.paymentDetails.transactionStatus = 'refunded';
        order.paymentDetails.transactionDate = new Date();
        await order.save();
      }

      // Mistaken cancellation rollback → restore transaction
      if (
        ['pending','processing', 'confirmed', 'shipped', 'delivered'].includes(status) &&
        txnStatus === 'refunded'
      ) {
        order.paymentDetails.transactionStatus = 'completed';
        order.paymentDetails.transactionDate = new Date();
        await order.save();
      }
    }

    // Send Email Notification
    const customerEmail = order.userDetails?.email;
    if (customerEmail) {
      const { username, contactNumber } = order.userDetails;
      const { order_status, order_requested_date, order_requested_time } =
        order.orderDetails;
      const productsHTML = order.productDetails
        .map(
          (product) => `
            <tr>
              <td style="padding: 8px 0;">${product.productName}</td>
              <td style="padding: 8px 0;">${product.quantity}</td>
              <td style="padding: 8px 0;">₹${product.amount}</td>
            </tr>
          `,
        )
        .join('');

      const statusColors = {
        pending: '#FFA500',
        confirmed: '#4CAF50',
        processing: '#2196F3',
        shipped: '#9C27B0',
        delivered: '#4CAF50',
        cancelled: '#F44336',
      };

      const statusMessages = {
        pending: 'is being reviewed by our team',
        confirmed: 'has been confirmed and is being prepared',
        processing: 'is being carefully prepared',
        shipped: 'has been shipped and is on its way',
        delivered: 'has been successfully delivered',
        cancelled: 'has been cancelled as per your request',
      };

      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          <div style="background-color: #4caf50; color: white; padding: 20px; text-align: center;">
            <h2>A4-CELEBRATION - Order Status Update</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your order <strong>#${order.order_id}</strong> ${
        statusMessages[status] || 'status has been updated'
      }:
              <span style="color: ${
                statusColors[status] || '#d32f2f'
              }; font-weight: bold;">
                ${status.toUpperCase()}
              </span>
            </p>

            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h3>
            <p><strong>Requested Date:</strong> ${order_requested_date} at ${order_requested_time}</p>
            <p><strong>Contact:</strong> ${contactNumber}</p>
            <p><strong>Delivery Address:</strong> ${
              order.addressDetails.home_address
            }</p>
            <p><strong>Delivery Slot:</strong> ${order.deliveryNotes}</p>

            <h3 style="margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Products</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="text-align: left; background-color: #f5f5f5;">
                  <th style="padding: 8px 0;">Product</th>
                  <th style="padding: 8px 0;">Qty</th>
                  <th style="padding: 8px 0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>

            <h3 style="margin-top: 20px;">Total Amount: ₹${
              order.paymentDetails.totalAmount
            }</h3>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 14px;">
            <p>Thanks for choosing A4-CELEBRATION! ❤️</p>
            <p style="color: #888;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      `;

      await sendEmail(
        customerEmail,
        'A4-CELEBRATION - Order Status Update',
        emailBody,
      );
      console.log(`Email sent to ${customerEmail} for status: ${status}`);
    }

    res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// GET /api/orders/user/:userId
exports.getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const orders = await Order.find({ 'userDetails.userId': userId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No orders found for this user',
      });
    }

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// GET /api/orders/category/:category
exports.getOrdersByCategory = async (req, res) => {
  try {
    const category = req.params.category.toUpperCase(); // e.g., 'GIFT'

    const orders = await Order.find({
      productDetails: {
        $elemMatch: {
          productId: { $regex: `^PROD-${category}-`, $options: 'i' },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No orders found for this category',
      });
    }

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

//PRODUCT BY ID
// Get Orders by Product ID - Returns full order documents
exports.getOrderByProductID = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find orders containing this product
    const orders = await Order.find({
      'productDetails.productId': productId,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'No orders found for this product',
      });
    }

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders, // Return full order documents
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
