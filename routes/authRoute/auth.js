const express = require('express');
const router = express.Router();
const auth = require('../../controllers/authController/auth');
const validate = require('express-validation');
const authValidation = require('../../validations/auth');
const authorize = require('../../middleware/authorize');

router.route('/auth/login').post(validate(authValidation.loginParam), auth.login);
router.route('/auth/checkExist').post(validate(authValidation.emailParam), auth.checkExist);
router.route('/auth/register').post(validate(authValidation.loginParam), auth.register);
router.route('/auth/canResetPassword').post(authorize, auth.canResetPassword);
router.route('/auth/resetPassword').post(authorize, auth.resetPassword);
router.route('/auth/forgotPassword').post(validate(authValidation.emailParam), auth.forgotPassword);
router.route('/auth/logout').post(auth.logout);
router.route('/auth/getCurrentUser').post(authorize, auth.getCurrentUser);
router.route('/auth/canUpdateProfile').post(authorize, auth.canUpdateProfile);
router.route('/auth/updateProfile').post(authorize, auth.updateProfile);

module.exports = router;
