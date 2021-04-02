const express = require('express');
const router = express.Router();

const isAdmin = require('../middleware/isAdmin');
const isAuthentication = require('../middleware/authentication');
const locals = require('../middleware/locals');

const adminController = require('../controllers/admin');

router.get('/products', locals, isAuthentication, adminController.getProducts);

router.get('/choose-category', locals, isAuthentication, adminController.getChooseCategory);

//router.post('/choose-category', locals, isAuthentication, adminController.postChooseCategory);

router.get('/choose-sub-category/:categoryid', locals, isAuthentication, adminController.getChooseSubCategory);

router.get('/choose-sub-sub-category/:categoryid', locals, isAuthentication, adminController.getChooseSubSubCategory);
//router.post('/choose-sub-category', locals, isAuthentication, adminController.postChooseSubCategory);

router.get('/add-product/:categoryid', locals, isAuthentication, adminController.getAddProduct);

router.post('/add-product', locals, isAuthentication, adminController.postAddProduct);

router.get('/products/:productid', locals, isAuthentication, adminController.getEditProduct);

router.post('/products', locals, isAuthentication, adminController.postEditProduct);

router.post('/delete-product', locals, isAuthentication, adminController.postDeleteProduct);
//Kategori
router.get('/add-category', locals, isAdmin, adminController.getAddCategory);

router.post('/add-category', locals, isAdmin, adminController.postAddCategory);
//Alt Kategori
router.get('/add-sub-category', locals, isAdmin, adminController.getAddSubCategory);

router.post('/add-sub-category', locals, isAdmin, adminController.postAddSubCategory);
//En alt kategori
router.get('/add-sub-sub-category', locals, isAdmin, adminController.getAddSubSubCategory);

//router.post('/add-sub-sub-category', locals, isAdmin, adminController.postAddSubSubCategory);

router.get('/add-sub-sub-category-2/:categoryid', locals, isAdmin, adminController.getAddSubSubCategory2);

router.post('/add-sub-sub-category-2', locals, isAdmin, adminController.postAddSubSubCategory2);
//*********
router.get('/categories', locals, isAdmin, adminController.getCategories);

router.get('/subCategories/:categoryid', locals, isAdmin, adminController.getSubCategories);

router.get('/subsubCategories/:categoryid', locals, isAdmin, adminController.getSubSubCategories);

router.get('/categories/:categoryid', locals, isAdmin, adminController.getEditCategory);

router.get('/editsubCategories/:categoryid', locals, isAdmin, adminController.getEditSubCategory);

router.get('/editsubsubCategories/:categoryid', locals, isAdmin, adminController.getEditSubSubCategory);

router.post('/subCategories', locals, isAdmin, adminController.postEditSubCategory);

router.post('/subsubCategories', locals, isAdmin, adminController.postEditSubSubCategory);

router.post('/categories', locals, isAdmin, adminController.postEditCategory);

router.post('/delete-category', locals, isAdmin, adminController.postDeleteCategory);

router.post('/delete-sub-category', locals, isAdmin, adminController.postDeleteSubCategory);

router.post('/delete-sub-sub-category', locals, isAdmin, adminController.postDeleteSubSubCategory);

//confirmation işlemleri
//onaylanacak ürünleri getirme
router.get('/confirmation', locals, isAdmin, adminController.getConfirmation);

//cancel
router.get('/cancel-confirmation', locals, isAdmin, adminController.getConfirmation);

//incelenecek ürünleri getirme get
router.get('/confirmation/:productid', locals, isAdmin, adminController.getEditConfirmation);

//incelenen ürünü post etme
router.post('/confirmation', locals, isAdmin, adminController.postEditConfirmation);

//direk reddetme
router.post('/delete-confirmation', locals, isAdmin, adminController.postDeleteConfirmation);

//getall products
router.get('/all-products', locals, isAdmin, adminController.getAllProducts);

//getall users
router.get('/all-users', locals, isAdmin, adminController.getAllUsers);
//user delete
router.post('/delete-user', locals, isAdmin, adminController.postDeleteUser);

//all products
//incelenecek ürünleri getirme get
router.get('/all-products/:productid', locals, isAdmin, adminController.getEditAllProducts);

//incelenen ürünü post etme
router.post('/all-products', locals, isAdmin, adminController.postEditAllProducts);

router.post('/delete-all-products', locals, isAdmin, adminController.postDeleteAllProducts);

module.exports = router;