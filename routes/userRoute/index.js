const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const fridgeController = require('../../controllers/userController/fridgeController');
const packageController = require('../../controllers/userController/packageController');
const authValidation = require('../../validations/auth');
const authorize = require('../../middleware/authorize');

// router.route('/auth/login').post(validate(authValidation.loginParam), auth.login);

router.route('/user/getAllFridges').post(authorize, fridgeController.getAllFridges);
router.route('/user/createFridge').post(authorize, fridgeController.createFridge);
router.route('/user/updateFridge').post(authorize, fridgeController.updateFridge);
router.route('/user/updateFridgeActivaion').post(authorize, fridgeController.updateFridgeActivaion);
router.route('/user/deleteFridge').post(authorize, fridgeController.deleteFridge);
router.route('/user/updateHistory').post(authorize, fridgeController.updateHistory);
router.route('/user/getHistory').post(authorize, fridgeController.getHistory);
router.route('/user/updateHistoryForToday').post(authorize, fridgeController.updateHistoryForToday);
router.route('/user/getMainPackages').post(authorize, packageController.getMainPackages);
router.route('/user/getMainPackageByID').post(authorize, packageController.getMainPackageByID);

module.exports = router;
