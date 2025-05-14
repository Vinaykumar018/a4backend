const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');
const { createUser, loginUser,updateUser,getUserById } = require('../controllers/userController');
const {createCategory,getCategoryById,updateCategory,deleteCategory, getAllCategories }=require('../controllers/categoryController')

const {createProduct,updateProduct ,getProductById,deleteProduct ,getAllProducts }=require('../controllers/decorationController')


const {getAllRatingsForProduct ,createRating,updateRating ,getRatingById ,deleteRating  }=require('../controllers/ratingController')


const {addChildCategory,removeChildCategory}=require('../controllers/categoryController')


const {
 getCart,clearCart,addItem,removeItem,updateItem
} = require('../controllers/cartController');



const {
  createOrder,getAllOrders,getOrder,updateOrderStatus,cancelOrder
   
}=require("../controllers/orderController")


//api authentication
router.post('/signin', signin);
router.post('/signin', (req, res, next) => {
  signin(req, res).catch(next);
});
  


//user authentication
router.post('/user/create-user', authenticateToken, createUser);
router.post('/user/login-user', authenticateToken, loginUser);
router.put('/user/update-user/:id', authenticateToken,updateUser);
router.get('/user/get-user/:id', authenticateToken, getUserById);


//category

router.post('/category/create-category', authenticateToken, createCategory);
router.get('/category/get-category/:id', authenticateToken, getCategoryById);
router.put('/category/update-category/:id', authenticateToken, updateCategory);
router.delete('/category/delete-category/:id', authenticateToken, deleteCategory);
router.get('/category/get-all-categories', authenticateToken, getAllCategories);
router.post('/category/add-child-category/:id', authenticateToken, addChildCategory);
router.delete('/category/remove-child-category/:id', authenticateToken, removeChildCategory);




//product 

router.post('/decoration/create-product', authenticateToken, createProduct);
router.put('/decoration/update-product/:id', authenticateToken, updateProduct);
router.get('/decoration/get-product/:id', authenticateToken, getProductById);
router.delete('/decoration/delete-product/:id', authenticateToken, deleteProduct);
router.get('/decoration/get-all-products', authenticateToken, getAllProducts);


//rating 

router.post('/rating/create-rating', authenticateToken, createRating); // Create a new rating
router.put('/rating/update-rating/:id', authenticateToken, updateRating); // Update an existing rating
router.get('/rating/get-rating/:id', authenticateToken, getRatingById); // Get a rating by its ID
router.delete('/rating/delete-rating/:id', authenticateToken, deleteRating); // Delete a rating by its ID
router.get('/rating/product/:product_id', authenticateToken, getAllRatingsForProduct); // Get all ratings for a product


//cart 
// cart
router.get('/cart/:userID', authenticateToken, getCart);            // Get cart for a user
router.post('/cart/add', authenticateToken, addItem);               // Add item to cart
router.put('/cart/update/:userID/:product_id', authenticateToken, updateItem); // Update quantity or info
router.delete('/cart/remove/:userID', authenticateToken, removeItem); // Remove specific product
router.delete('/cart/clear/:userID', authenticateToken, clearCart); // Clear all items in cart




//order
router.post('/create/order', authenticateToken,createOrder); 
router.get('/get/orders', authenticateToken,getAllOrders);
router.get('/get/order/:id', authenticateToken,getOrder); 



module.exports = router;