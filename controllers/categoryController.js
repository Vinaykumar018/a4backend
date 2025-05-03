const Category = require('../model/categoryModel');
const upload = require('../middlewares/Allcategories');
const uploadChildImage = require('../middlewares/childCategoryImages');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// CREATE CATEGORY (unchanged)
exports.createCategory = [
  upload,
  async (req, res) => {
    try {
      const { category_name, description, slug_url, status } = req.body;

      if (!category_name) {
        return res.status(400).json({ message: 'Category name is required', status: 0 });
      }

      const newCategory = new Category({
        category_name,
        description,
        slug_url,
        status
      });

      if (req.file) {
        newCategory.category_image = path.join('uploads', 'categories', req.file.filename);
      }

      await newCategory.save();

      res.status(200).json({ message: 'Category created', status: 1, data: newCategory });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// UPDATE CATEGORY (unchanged)
exports.updateCategory = [
  upload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Category not found', status: 0 });

      const updateData = req.body;

      if (req.file) {
        if (category.category_image) {
          const oldPath = path.join(__dirname, '../public', category.category_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.category_image = path.join('uploads', 'categories', req.file.filename);
      }

      updateData.updated_at = new Date();

      const updatedCategory = await Category.findByIdAndUpdate(id, updateData, { new: true });
      res.json({ message: 'Category updated', status: 1, data: updatedCategory });
    } catch (err) {
      res.status(500).json({ message: err.message, status: 0 });
    }
  }
];

// GET CATEGORY BY ID (unchanged)
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found', status: 0 });

    res.json({ message: 'Category found', status: 1, data: category });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// DELETE CATEGORY (unchanged)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found', status: 0 });

    if (category.category_image) {
      const imagePath = path.join(__dirname, '../public', category.category_image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    res.json({ message: 'Category deleted', status: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message, status: 0 });
  }
};

// GET ALL CATEGORIES (unchanged)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ 
      message: 'Categories retrieved successfully', 
      status: 1, 
      data: categories 
    });
  } catch (err) {
    res.status(500).json({ 
      message: err.message, 
      status: 0 
    });
  }
};

// ADD CHILD CATEGORY (improved)
exports.addChildCategory = [
  uploadChildImage,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { child_category_name } = req.body;
      console.log(req.body)
      console.log(id)
      
      if (!child_category_name || typeof child_category_name !== 'string') {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: 'Valid child category name is required', 
          status: 0 
        });
      }

      const category = await Category.findById(id);
      console.log(category)
      if (!category) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ 
          message: 'Parent category not found', 
          status: 0 
        });
      }

      const uniqueId = uuidv4();
      const imagePath = req.file ? path.join('uploads', 'child-categories', req.file.filename) : null;

      if (!category.child_category) {
        category.child_category = new Map();
      }

      category.child_category.set(uniqueId, {
        name: child_category_name.trim(),
        image: imagePath
      });
      
      category.updated_at = new Date();
      await category.save();

      res.status(201).json({ 
        message: 'Child category added successfully', 
        status: 1, 
        data: {
          id: uniqueId,
          name: child_category_name.trim(),
          image: imagePath ? `/uploads/child-categories/${req.file.filename}` : null
        }
      });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error('Error adding child category:', err);
      res.status(500).json({ 
        message: 'Failed to add child category', 
        status: 0 
      });
    }
  }
];

// REMOVE CHILD CATEGORY (improved)
exports.removeChildCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { child_ids } = req.body;

    if (!child_ids || !Array.isArray(child_ids) || child_ids.length === 0) {
      return res.status(400).json({ 
        message: 'child_ids must be a non-empty array', 
        status: 0 
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        message: 'Parent category not found', 
        status: 0 
      });
    }

    if (!category.child_category || category.child_category.size === 0) {
      return res.status(404).json({ 
        message: 'No child categories found', 
        status: 0 
      });
    }

    let deletedCount = 0;
    const deletedImages = [];

    child_ids.forEach(child_id => {
      if (category.child_category.has(child_id)) {
        const child = category.child_category.get(child_id);
        if (child.image) {
          deletedImages.push(child.image);
        }
        category.child_category.delete(child_id);
        deletedCount++;
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ 
        message: 'No matching child categories found to remove', 
        status: 0 
      });
    }

    // Delete associated image files
    deletedImages.forEach(imagePath => {
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error('Failed to delete child category image:', err);
        }
      }
    });

    category.updated_at = new Date();
    await category.save();

    res.status(200).json({
      message: `${deletedCount} child ${deletedCount === 1 ? 'category' : 'categories'} removed successfully`,
      status: 1,
      data: {
        parentId: id,
        removedCount: deletedCount
      }
    });
  } catch (err) {
    console.error('Error removing child categories:', err);
    res.status(500).json({ 
      message: 'Failed to remove child categories', 
      status: 0 
    });
  }
};