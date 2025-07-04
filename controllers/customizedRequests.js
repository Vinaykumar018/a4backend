const CustomizedRequest = require("../model/customizedSchema");
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

// Helper function for sanitization
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
  }
  return input;
};

// Helper function for validation
const validateInputs = (req, res, requiredFields) => {
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required`, status: 0 });
    }
  }

  // Validate email if provided
  if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email format', status: 0 });
  }

  // Validate phone number
  if (req.body.phone_number && !validator.isMobilePhone(req.body.phone_number, 'any', { strictMode: false })) {
    return res.status(400).json({ message: 'Invalid phone number', status: 0 });
  }

  // Validate date
  if (req.body.event_date && !validator.isISO8601(req.body.event_date)) {
    return res.status(400).json({ message: 'Invalid date format. Use ISO8601 format', status: 0 });
  }

  return null;
};

// CREATE CUSTOMIZED REQUEST
exports.createCustomizedRequest = async (req, res) => {
  try {
    const requiredFields = ['product_id', 'user_id', 'phone_number', 'name', 'event_date', 'guest_count', 'food_preference', 'budget_range'];
    const validationError = validateInputs(req, res, requiredFields);
    if (validationError) return validationError;

    // Sanitize all inputs
    const sanitizedData = {};
    for (const [key, value] of Object.entries(req.body)) {
      sanitizedData[key] = sanitizeInput(value);
    }

    const newRequest = new CustomizedRequest(sanitizedData);
    await newRequest.save();

    res.status(200).json({ 
      message: 'Customized request submitted successfully', 
      status: 1, 
      data: newRequest 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// UPDATE CUSTOMIZED REQUEST
exports.updateCustomizedRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({ message: 'Invalid request ID format', status: 0 });
    }

    const request = await CustomizedRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found', status: 0 });

    // Sanitize all updates
    const sanitizedUpdates = {};
    for (const [key, value] of Object.entries(req.body)) {
      sanitizedUpdates[key] = sanitizeInput(value);
    }

    Object.assign(request, sanitizedUpdates);
    await request.save();

    res.json({ 
      message: 'Request updated successfully', 
      status: 1, 
      data: request 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET REQUEST BY ID
exports.getCustomizedRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({ message: 'Invalid request ID format', status: 0 });
    }

    const request = await CustomizedRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found', status: 0 });

    res.json({ 
      message: 'Request found', 
      status: 1, 
      data: request 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE REQUEST
exports.deleteCustomizedRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({ message: 'Invalid request ID format', status: 0 });
    }

    const deleted = await CustomizedRequest.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Request not found', status: 0 });

    res.json({ 
      message: 'Request deleted successfully', 
      status: 1 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL REQUESTS (optional filtering)
exports.getAllCustomizedRequests = async (req, res) => {
  try {
    const { product_id, user_id } = req.query;
    const filter = {};
    
    if (product_id) {
      if (!validator.isMongoId(product_id)) {
        return res.status(400).json({ message: 'Invalid product ID format', status: 0 });
      }
      filter.product_id = product_id;
    }
    
    if (user_id) {
      if (!validator.isMongoId(user_id)) {
        return res.status(400).json({ message: 'Invalid user ID format', status: 0 });
      }
      filter.user_id = user_id;
    }

    const requests = await CustomizedRequest.find(filter);
    res.json({ 
      message: 'Requests retrieved successfully', 
      status: 1, 
      data: requests 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// UPDATE REQUEST STATUS
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, quoted_price, final_price } = req.body;

    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({ message: 'Invalid request ID format', status: 0 });
    }

    // Validate required fields
    if (!status) {
      return res.status(400).json({ message: 'Status is required', status: 0 });
    }

    // Validate status value
    const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'confirmed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: pending, approved, rejected, completed, confirmed', 
        status: 0 
      });
    }

    // Find the request
    const request = await CustomizedRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found', status: 0 });
    }

    // Update fields with sanitization
    request.status = sanitizeInput(status);
    if (admin_notes) request.admin_notes = sanitizeInput(admin_notes);
    if (quoted_price) {
      if (!validator.isNumeric(quoted_price.toString())) {
        return res.status(400).json({ message: 'Quoted price must be a number', status: 0 });
      }
      request.quoted_price = Number(quoted_price);
    }
    if (final_price) {
      if (!validator.isNumeric(final_price.toString())) {
        return res.status(400).json({ message: 'Final price must be a number', status: 0 });
      }
      request.final_price = Number(final_price);
    }

    await request.save();

    res.json({ 
      message: 'Request status updated successfully', 
      status: 1, 
      data: request 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL REQUESTS BY USER ID
exports.getCustomizedRequestsByUserId = async (req, res) => {
  try {

    
    const { user_id } = req.params;

    // Validate user ID format
    if (!validator.isMongoId(user_id)) {
      return res.status(400).json({ message: 'Invalid user ID format', status: 0 });
    }

    const requests = await CustomizedRequest.find({ user_id });

    if (requests.length === 0) {
      return res.status(404).json({ message: 'No requests found for this user', status: 0 });
    }

    res.status(200).json({
      message: 'User requests fetched successfully',
      status: 1,
      data: requests
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};
