const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { signin, authenticateToken } = require('../middlewares/authMiddleware');
const {
  createUser,
  loginUser,
  updateUser,
  getUserById,
} = require('../controllers/userController');
const {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllCategories,
} = require('../controllers/categoryController');

const {
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  getAllProducts,
  getProductBy_id,
} = require('../controllers/decorationController');

const {
  giftsCreateProduct,
  giftsUpdateProduct,
  giftsGetAllProducts,
  giftsProductById,
  giftsProductBy_id,
  giftsDeleteProduct,
} = require('../controllers/giftingController');

const {
  getAllRatingsForProduct,
  createRating,
  updateRating,
  getRatingById,
  deleteRating,
} = require('../controllers/ratingController');

const {
  addChildCategory,
  removeChildCategory,
} = require('../controllers/categoryController');

const {
  getCart,
  clearCart,
  addItem,
  removeItem,
  updateItem,
} = require('../controllers/cartController');

const {
  createNewOrder,
  getAllOrders,
  getOrderByID,
  updateOrderStatus,
  cancelDecorationOrder,
  verifyPayment,
  getOrdersByCategory,
  getOrdersByUserId,
} = require('../controllers/OrderController');



const {
  eventManagementCreate,eventManagementUpdate,eventManagementDelete,eventManagementById,eventManagementBy_id,
  eventManagementGetAll
} = require('../controllers/eventManagementController');



const {
 createCustomizedRequest,updateCustomizedRequest,getCustomizedRequestById,getAllCustomizedRequests,
 updateRequestStatus,
 getCustomizedRequestsByUserId
} = require('../controllers/customizedRequests');



const {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} = require("../controllers/wishListController");


const { googleAuth } = require('../controllers/googleAuthController');
const { createContact } = require('../controllers/contactController');
//api authentication
router.post('/signin', signin);
router.post('/signin', (req, res, next) => {
  signin(req, res).catch(next);
});

//user authentication
router.post('/user/create-user', authenticateToken, createUser);
router.post('/user/login-user', authenticateToken, loginUser);
router.put('/user/update-user/:id', authenticateToken, updateUser);
router.get('/user/get-user/:id', authenticateToken, getUserById);
router.get('/auth/google', authenticateToken, googleAuth);

//category

router.post('/category/create-category', authenticateToken, createCategory);
router.get('/category/get-category/:id', authenticateToken, getCategoryById);
router.put('/category/update-category/:id', authenticateToken, updateCategory);
router.delete(
  '/category/delete-category/:id',
  authenticateToken,
  deleteCategory,
);
router.get('/category/get-all-categories', authenticateToken, getAllCategories);
router.post(
  '/category/add-child-category/:id',
  authenticateToken,
  addChildCategory,
);
router.delete(
  '/category/remove-child-category/:id',
  authenticateToken,
  removeChildCategory,
);

//product

router.post('/decoration/create-product', authenticateToken, createProduct);
router.put('/decoration/update-product/:id', authenticateToken, updateProduct);
router.get('/decoration/get-product/:id', authenticateToken, getProductById);
router.get(
  '/decoration/get-product-by-id/:id',
  authenticateToken,
  getProductBy_id,
);
router.delete(
  '/decoration/delete-product/:id',
  authenticateToken,
  deleteProduct,
);
router.get('/decoration/get-all-products', authenticateToken, getAllProducts);

//gifting

router.post('/giftings/create-product', authenticateToken, giftsCreateProduct);
router.put(
  '/giftings/update-product/:id',
  authenticateToken,
  giftsUpdateProduct,
);
router.get('/giftings/get-product/:id', authenticateToken, giftsProductById);
router.get(
  '/giftings/get-product-by-id/:id',
  authenticateToken,
  giftsProductBy_id,
);
router.delete(
  '/giftings/delete-product/:id',
  authenticateToken,
  giftsDeleteProduct,
);
router.get(
  '/giftings/get-all-products',
  authenticateToken,
  giftsGetAllProducts,
);

//rating

router.post('/rating/create-rating', authenticateToken, createRating); // Create a new rating
router.put('/rating/update-rating/:id', authenticateToken, updateRating); // Update an existing rating
router.get('/rating/get-rating/:id', authenticateToken, getRatingById); // Get a rating by its ID
router.delete('/rating/delete-rating/:id', authenticateToken, deleteRating); // Delete a rating by its ID
router.get(
  '/rating/product/:product_id',
  authenticateToken,
  getAllRatingsForProduct,
); // Get all ratings for a product

//cart
// cart
router.get('/cart/:userID', authenticateToken, getCart); // Get cart for a user
router.post('/cart/add', authenticateToken, addItem); // Add item to cart
router.put('/cart/update/:userId/:productId', authenticateToken, updateItem); // Update quantity or info
router.delete('/cart/remove/:userID', authenticateToken, removeItem); // Remove specific product
router.delete('/cart/clear/:userID', authenticateToken, clearCart); // Clear all items in cart

//order
router.post('/create/order', authenticateToken, createNewOrder);
router.get('/get/all/orders', authenticateToken, getAllOrders);
router.put('/order/update-status/:id', authenticateToken, updateOrderStatus);
router.put('/order/cancel-order-status/:id', authenticateToken, cancelDecorationOrder);
router.get('/get/order/:id', authenticateToken, getOrderByID);
router.post('/orders/verify-payment', authenticateToken, verifyPayment);
router.get(
  '/get/orders/category/:category',
  authenticateToken,
  getOrdersByCategory,
);
router.get('/get/orders/user/:userId', authenticateToken, getOrdersByUserId);


//gifting

router.post('/event/create-event',authenticateToken,eventManagementCreate
);
router.put('/event/update-event/:id',authenticateToken,eventManagementUpdate
);
router.get('/event/get-event/:id',authenticateToken,eventManagementById
);
router.get('/event/get-event-by-id/:id',authenticateToken,eventManagementBy_id

);router.delete('/event/delete-event/:id',authenticateToken,eventManagementDelete
);
router.get('/event/get-all-events',authenticateToken,eventManagementGetAll
);

//custom

router.post('/customized/create-request', authenticateToken, createCustomizedRequest);
router.put('/customized/update-request/:id', authenticateToken, updateCustomizedRequest);
router.get('/customized/get-request/:id', authenticateToken, getCustomizedRequestById);
router.get('/customized/get-all-requests', authenticateToken, getAllCustomizedRequests);
router.put('/customized/update-request-status/:id', authenticateToken, updateRequestStatus);
router.get('/customized/get-all-requests/:user_id', authenticateToken, getCustomizedRequestsByUserId);


//form contact

router.post('/contact',authenticateToken,createContact);



//

router.post("/addtoWishlist",authenticateToken, addToWishlist);
router.get("/getWishlist/:userId",authenticateToken,  getWishlist);
router.delete("/wishlist/:userId/:productId",authenticateToken, removeFromWishlist);



module.exports = router;
