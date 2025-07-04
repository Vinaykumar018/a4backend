const Product = require('../model/giftingProductSchema'); // Adjusted model import
const upload = require('../middlewares/AllProducts'); // Reuse existing middleware
const path = require('path');
const fs = require('fs');

// CREATE GIFTING PRODUCT
exports.giftsCreateProduct = [
  upload,
  async (req, res) => {
    try {
      const {
        product_id,
        name,
        slug_url,
        description,
        short_description,
        category,
        category_name,
        price,
        unit,
        stock_left,
        isOffer,
        status,
        child_categories = null
      } = req.body;

      if (!name || !slug_url || !price || !unit || !category_name || !category) {
        return res.status(400).json({ message: 'Missing required fields', status: 0 });
      }

      const newProduct = new Product({
        product_id,
        name,
        slug_url,
        description,
        short_description,
        category,
        category_name,
        price,
        unit,
        stock_left,
        isOffer,
        status,
        child_categories: JSON.parse(child_categories || 'null')
      });

      if (req.files?.featured_image) {
        newProduct.featured_image = path.join('uploads', 'products', req.files.featured_image[0].filename);
      }

      if (req.files?.other_images) {
        newProduct.other_images = req.files.other_images.map(file =>
          path.join('uploads', 'products', file.filename)
        );
      }

      await newProduct.save();
      res.status(200).json({ message: 'Gifting product created', status: 1, data: newProduct });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// UPDATE GIFTING PRODUCT
exports.giftsUpdateProduct = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found', status: 0 });

      const updateData = { ...req.body };

      if ('child_categories' in req.body) {
        updateData.child_categories = JSON.parse(req.body.child_categories || 'null');
      }

      if (req.files?.featured_image) {
        if (product.featured_image) {
          const oldPath = path.join(__dirname, '../public', product.featured_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.featured_image = path.join('uploads', 'products', req.files.featured_image[0].filename);
      }

      if (req.files?.other_images) {
        if (product.other_images?.length) {
          product.other_images.forEach(img => {
            const imgPath = path.join(__dirname, '../public', img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        }
        updateData.other_images = req.files.other_images.map(file =>
          path.join('uploads', 'products', file.filename)
        );
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ message: 'Product updated', status: 1, data: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// GET GIFTING PRODUCT BY _id
exports.giftsProductBy_id = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found', status: 0 });

    res.json({ message: 'Product found', status: 1, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET GIFTING PRODUCT BY product_id
exports.giftsProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ product_id: id });

    if (!product) return res.status(404).json({ message: 'Product not found', status: 0 });

    res.json({ message: 'Product found', status: 1, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE GIFTING PRODUCT
exports.giftsDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found', status: 0 });

    if (product.featured_image) {
      const imgPath = path.join(__dirname, '../public', product.featured_image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (product.other_images?.length) {
      product.other_images.forEach(img => {
        const imgPath = path.join(__dirname, '../public', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    res.json({ message: 'Product deleted', status: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL GIFTING PRODUCTS
exports.giftsGetAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ message: 'Products retrieved successfully', status: 1, data: products });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};
