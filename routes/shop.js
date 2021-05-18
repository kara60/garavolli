const express = require('express');
const router = express.Router();

const isAuthentication = require('../middleware/authentication');
const locals = require('../middleware/locals');

const shopController = require('../controllers/shop');

router.get('/', locals, shopController.getIndex);

router.get('/products', locals, shopController.getProducts);

router.get('/products/:productid', locals, shopController.getProduct);

router.get('/categories/:subsubcategoryid', locals, shopController.getProductsByCategoryId);

router.get('/search', locals, shopController.getSearch);

router.get('/contact', locals, shopController.getContact);

router.get('/cart', locals, isAuthentication, shopController.getCart);

router.post('/cart', locals, isAuthentication, shopController.postCart);

router.post('/delete-cartitem', locals, shopController.postCartItemDelete);

router.get('/orders', locals, isAuthentication, shopController.getOrders);

router.post('/create-order', locals, isAuthentication, shopController.postOrder);

module.exports = router;