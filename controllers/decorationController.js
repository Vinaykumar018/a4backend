const Product = require('../model/decorationModel');
const upload = require('../middlewares/AllProducts'); // separate middleware for product images
const path = require('path');
const fs = require('fs');

// // CREATE PRODUCT
// exports.createProduct = [
//   upload, // middleware for handling file uploads
//   async (req, res) => {
//     try {
//       const {
//         product_id,
//         name,
//         slug_url,
//         description,
//         short_description,
//         category,
//         category_name,
//         mrp_price,
//         price,
//         unit,
//         stock_left,
//         isOffer,
//         status,
//         child_categories,
//         available_cities
//       } = req.body;

//       // Validate required fields
//       if (
//         !name ||
//         !slug_url ||
//         !mrp_price ||
//         !price ||
//         !category_name ||
//         !category
//       ) {
//         return res
//           .status(400)
//           .json({ message: 'Missing required fields', status: 0 });
//       }

//       // Parse JSON fields if sent as strings (from FormData)
//       let parsedChildCategories = null;
//       let parsedAvailableCities = [];

//       try {
//         parsedChildCategories = child_categories
//           ? JSON.parse(child_categories)
//           : null;
//       } catch (err) {
//         return res
//           .status(400)
//           .json({ message: 'Invalid JSON in child_categories', status: 0 });
//       }

//       try {
//         parsedAvailableCities = Array.isArray(available_cities)
//           ? available_cities
//           : JSON.parse(available_cities || '[]');
//       } catch (err) {
//         return res
//           .status(400)
//           .json({ message: 'Invalid JSON in available_cities', status: 0 });
//       }

//       // Create new product
//       const newProduct = new Product({
//         product_id,
//         name,
//         slug_url,
//         description,
//         short_description,
//         category,
//         category_name,
//         mrp_price,
//         price,
//         unit,
//         stock_left,
//         isOffer,
//         status,
//         child_categories: parsedChildCategories,
//         available_cities: parsedAvailableCities
//       });

//       // Handle images
//       if (req.files?.featured_image) {
//         newProduct.featured_image = path.join(
//           'uploads',
//           'products',
//           req.files.featured_image[0].filename
//         );
//       }

//       if (req.files?.other_images) {
//         newProduct.other_images = req.files.other_images.map((file) =>
//           path.join('uploads', 'products', file.filename)
//         );
//       }

//       // Save to DB
//       await newProduct.save();

//       return res.status(200).json({
//         message: 'Product created',
//         status: 1,
//         data: newProduct
//       });
//     } catch (err) {
//       return res.status(500).json({
//         message: err.message,
//         status: 0
//       });
//     }
//   }
// ];

// exports.updateProduct = [
//   upload,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const product = await Product.findById(id);
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: 'Product not found', status: 0 });
//       }

//       const updateData = { ...req.body };

//       // Parse child_categories if present
//       if ('child_categories' in req.body) {
//         try {
//           updateData.child_categories = req.body.child_categories
//             ? JSON.parse(req.body.child_categories)
//             : null;
//         } catch (err) {
//           return res.status(400).json({
//             message: 'Invalid JSON in child_categories',
//             status: 0,
//           });
//         }
//       }

//       // Parse available_cities if present
//       if ('available_cities' in req.body) {
//         try {
//           updateData.available_cities = Array.isArray(req.body.available_cities)
//             ? req.body.available_cities
//             : JSON.parse(req.body.available_cities || '[]');
//         } catch (err) {
//           return res.status(400).json({
//             message: 'Invalid JSON in available_cities',
//             status: 0,
//           });
//         }
//       }

//       // Handle featured image replacement
//       if (req.files?.featured_image) {
//         if (product.featured_image) {
//           const oldPath = path.join(
//             __dirname,
//             '../public',
//             product.featured_image,
//           );
//           if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//         }
//         updateData.featured_image = path.join(
//           'uploads',
//           'products',
//           req.files.featured_image[0].filename,
//         );
//       }

//       // Handle other images replacement
//       if (req.files?.other_images) {
//         if (product.other_images?.length) {
//           product.other_images.forEach((img) => {
//             const imgPath = path.join(__dirname, '../public', img);
//             if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
//           });
//         }
//         updateData.other_images = req.files.other_images.map((file) =>
//           path.join('uploads', 'products', file.filename),
//         );
//       }

//       const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
//         new: true,
//       });

//       res.json({ message: 'Product updated', status: 1, data: updatedProduct });
//     } catch (err) {
//       res.status(500).json({ message: err.message, status: 0 });
//     }
//   },
// ];



// CREATE PRODUCT
exports.createProduct = [
  upload, // middleware for handling file uploads
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
        mrp_price,
        price,
        unit,
        stock_left,
        isOffer,
        status,
        child_categories,
        available_cities
      } = req.body;

      // Validate required fields
      if (
        !name ||
        !slug_url ||
        !mrp_price ||
        !price ||
        !category_name ||
        !category
      ) {
        return res
          .status(400)
          .json({ message: 'Missing required fields', status: 0 });
      }

      // Parse JSON fields if sent as strings (from FormData)
      let parsedChildCategories = null;
      let parsedAvailableCities = [];

      try {
        parsedChildCategories = child_categories
          ? JSON.parse(child_categories)
          : null;
      } catch (err) {
        return res
          .status(400)
          .json({ message: 'Invalid JSON in child_categories', status: 0 });
      }

      try {
        parsedAvailableCities = Array.isArray(available_cities)
          ? available_cities
          : JSON.parse(available_cities || '[]');
      } catch (err) {
        return res
          .status(400)
          .json({ message: 'Invalid JSON in available_cities', status: 0 });
      }

      // Create new product
      const newProduct = new Product({
        product_id,
        name,
        slug_url,
        description,
        short_description,
        category,
        category_name,
        mrp_price,
        price,
        unit,
        stock_left,
        isOffer,
        status,
        child_categories: parsedChildCategories,
        available_cities: parsedAvailableCities
      });

      // Handle images
      if (req.files?.featured_image) {
        newProduct.featured_image = path.join(
          'uploads',
          'products',
          req.files.featured_image[0].filename
        );
      }

      if (req.files?.other_images) {
        newProduct.other_images = req.files.other_images.map((file) =>
          path.join('uploads', 'products', file.filename)
        );
      }

      // Save to DB
      await newProduct.save();

      return res.status(200).json({
        message: 'Product created',
        status: 1,
        data: newProduct
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        status: 0
      });
    }
  }
];

exports.updateProduct = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ message: 'Product not found', status: 0 });
      }

      const updateData = { ...req.body };

      // Parse child_categories if present
      if ('child_categories' in req.body) {
        try {
          updateData.child_categories = req.body.child_categories
            ? JSON.parse(req.body.child_categories)
            : null;
        } catch (err) {
          return res.status(400).json({
            message: 'Invalid JSON in child_categories',
            status: 0,
          });
        }
      }

      // Parse available_cities if present
      if ('available_cities' in req.body) {
        try {
          updateData.available_cities = Array.isArray(req.body.available_cities)
            ? req.body.available_cities
            : JSON.parse(req.body.available_cities || '[]');
        } catch (err) {
          return res.status(400).json({
            message: 'Invalid JSON in available_cities',
            status: 0,
          });
        }
      }

      // Handle featured image replacement
      if (req.files?.featured_image) {
        if (product.featured_image) {
          const oldPath = path.join(
            __dirname,
            '../public',
            product.featured_image,
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.featured_image = path.join(
          'uploads',
          'products',
          req.files.featured_image[0].filename,
        );
      }

      // Handle other images replacement
      if (req.files?.other_images) {
        if (product.other_images?.length) {
          product.other_images.forEach((img) => {
            const imgPath = path.join(__dirname, '../public', img);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        }
        updateData.other_images = req.files.other_images.map((file) =>
          path.join('uploads', 'products', file.filename),
        );
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.json({ message: 'Product updated', status: 1, data: updatedProduct });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  },
];


// GET PRODUCT BY _id
exports.getProductBy_id = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: 'Product not found', status: 0 });

    res.json({ message: 'Product found', status: 1, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET PRODUCT BY product_id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params; // here 'id' is actually the product_id
    const product = await Product.findOne({ product_id: id });

    if (!product)
      return res.status(404).json({ message: 'Product not found', status: 0 });

    res.json({ message: 'Product found', status: 1, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product)
      return res.status(404).json({ message: 'Product not found', status: 0 });

    // Remove images from storage
    if (product.featured_image) {
      const imgPath = path.join(__dirname, '../public', product.featured_image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    if (product.other_images?.length) {
      product.other_images.forEach((img) => {
        const imgPath = path.join(__dirname, '../public', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    res.json({ message: 'Product deleted', status: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      message: 'Products retrieved successfully',
      status: 1,
      data: products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};
