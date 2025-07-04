const eventManagement = require('../model/eventManagementSchema');
const upload = require('../middlewares/AllProducts');
const path = require('path');
const fs = require('fs');

// CREATE WEDDING DESTINATION
exports.eventManagementCreate = [
  upload,
  async (req, res) => {
    try {
      const {
        product_id,
        name,
        slug_url,
        description,
        category,
        category_name,
        price,
        food_type,
        pax,
        room,
        city,
        venue,
        package_by,
        offer_ends_in,
        whatsapp,
        package_details,
        day_plans,
        package_includes,
        status,
        child_categories = null
      } = req.body;

      if (!name || !slug_url || !price || !category_name || !category || 
          !food_type || !pax || !room || !city || !venue || !package_details) {
        return res.status(400).json({ message: 'Missing required fields', status: 0 });
      }

      const newDestination = new eventManagement({
        product_id,
        name,
        slug_url,
        description,
        category,
        category_name,
        price,
        food_type,
        pax,
        room,
        city,
        venue,
        package_by,
        offer_ends_in,
        whatsapp,
        package_details,
        day_plans: day_plans ? JSON.parse(day_plans) : undefined,
        package_includes: package_includes ? JSON.parse(package_includes) : undefined,
        status,
        child_categories: child_categories ? JSON.parse(child_categories) : null
      });

      if (req.files?.featured_image) {
        newDestination.featured_image = path.join('uploads',  'products', req.files.featured_image[0].filename);
      }

      if (req.files?.other_images) {
        newDestination.other_images = req.files.other_images.map(file =>
          path.join('uploads',  'products', file.filename)
        );
      }

      await newDestination.save();
      res.status(200).json({ message: 'event created', status: 1, data: newDestination });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// UPDATE WEDDING DESTINATION
exports.eventManagementUpdate = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await eventManagement.findById(id);
      if (!Event) return res.status(404).json({ message: 'Wedding Event not found', status: 0 });

      const updateData = { ...req.body };

      if ('day_plans' in req.body) {
        updateData.day_plans = JSON.parse(req.body.day_plans || '{}');
      }

      if ('package_includes' in req.body) {
        updateData.package_includes = JSON.parse(req.body.package_includes || '{}');
      }

      if ('child_categories' in req.body) {
        updateData.child_categories = JSON.parse(req.body.child_categories || 'null');
      }

      if (req.files?.featured_image) {
        if (Event.featured_image) {
          const oldPath = path.join(__dirname, '../public', destination.featured_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.featured_image = path.join('uploads', 'products', req.files.featured_image[0].filename);
      }

      if (req.files?.other_images) {
        if (destination.other_images?.length) {
          destination.other_images.forEach(img => {
            const imgPath = path.join(__dirname, '../public', img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        }
        updateData.other_images = req.files.other_images.map(file =>
          path.join('uploads', 'products', file.filename)
        );
      }

      const updatedDestination = await eventManagement.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ message: 'event updated', status: 1, data: updatedDestination });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// GET WEDDING DESTINATION BY _id
exports.eventManagementBy_id = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await eventManagement.findById(id);
    if (!destination) return res.status(404).json({ message: 'event not found', status: 0 });

    res.json({ message: 'event found', status: 1, data: destination });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET WEDDING DESTINATION BY product_id
exports.eventManagementById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await eventManagement.findOne({ product_id: id });

    if (!destination) return res.status(404).json({ message: 'event not found', status: 0 });

    res.json({ message: 'event found', status: 1, data: destination });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE WEDDING DESTINATION
exports.eventManagementDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await eventManagement.findByIdAndDelete(id);
    if (!destination) return res.status(404).json({ message: 'event not found', status: 0 });

    if (destination.featured_image) {
      const imgPath = path.join(__dirname, '../public', destination.featured_image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (destination.other_images?.length) {
      destination.other_images.forEach(img => {
        const imgPath = path.join(__dirname, '../public', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    res.json({ message: 'event deleted', status: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL WEDDING DESTINATIONS
exports.eventManagementGetAll = async (req, res) => {
  try {
    const destinations = await eventManagement.find();
    res.json({ message: 'events retrieved successfully', status: 1, data: destinations });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET WEDDING DESTINATIONS BY CATEGORY
exports.eventManagementByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const destinations = await eventManagement.find({ category: category_id });
    
    if (!destinations.length) {
      return res.status(404).json({ 
        message: 'No wedding destinations found for this category', 
        status: 0 
      });
    }

    res.json({ 
      message: 'events retrieved by category', 
      status: 1, 
      data: destinations 
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};