const express = require('express');
const router = express.Router();

const isntAuthentication = require('../middleware/isntAuthentication');
const accountController = require('../controllers/account');
const locals = require('../middleware/locals');

router.get('/login', locals, isntAuthentication, accountController.getLogin);
router.post('/login', locals,isntAuthentication, accountController.postLogin);

router.get('/verify/:ids', locals,isntAuthentication, accountController.verifyUser);

router.get('/register', locals,isntAuthentication, accountController.getRegister);
router.post('/register', locals,isntAuthentication, accountController.postRegister);

router.get('/logout', locals, accountController.getlogout);

router.get('/reset-password', locals, accountController.getReset);
router.post('/reset-password', locals,accountController.postReset);

router.get('/reset-password/:token', locals, accountController.getNewPassword);
router.post('/new-password', locals, accountController.postNewPassword);
router.get('/registerTxt', locals, accountController.getRegisterTxt);
module.exports = router;
