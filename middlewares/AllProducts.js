const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure product upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

// Expecting featured_image as single and other_images as array
const addProductPhotos = multer({ storage: storage }).fields([
  { name: 'featured_image', maxCount: 1 },
  { name: 'other_images', maxCount: 10 }
]);

module.exports = addProductPhotos;
