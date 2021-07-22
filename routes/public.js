const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController/auth');
const test = require('../controllers/test');
const validate = require('express-validation');
const authValidation = require('../validations/auth')

router.route('/authRoute/login').post(validate(authValidation.loginParam), auth.login);
// router.route('/test').post(test.testController);
router.get('/createBaseDB', test.createBaseDB);
router.get('/clearDB', test.clearDB);

module.exports = router;
