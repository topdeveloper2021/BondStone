const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const fridgeManage = require('../../controllers/commonController/fridgeManage');
const formController = require('../../controllers/commonController/formController');
const notificationController = require('../../controllers/commonController/notificationController');
const paymentController = require('../../controllers/commonController/paymentController');
const authorize = require('../../middleware/authorize');

// router.route('/common/getFridgeTypes').post(authorize, commonController.getFridgeTypes);
router.get('/common/getFridgeTypes', authorize, fridgeManage.getFridgeTypes);
router.route('/common/sendReportByEmail').post(authorize, formController.sendReportByEmail);
router.route('/notify/setStatus').post(authorize, notificationController.setStatus);
router.route('/notify/setPlayerId').post(authorize, notificationController.setPlayerId);
router.route('/notify/setSchedules').post(authorize, notificationController.setSchedules);
router.route('/notify/getSchedule').post(authorize, notificationController.getSchedule);
// router.get('/notify/getSchedule',authorize, notificationController.getSchedule);

// Payment
router.route('/checkout/executePayWithPaypal').post(authorize, paymentController.executePayWithPaypal);
router.route('/checkout/createPaymentWithPaypal').post(authorize, paymentController.createPaymentWithPaypal);
router.route('/checkout/executePayWithStripe').post(authorize, paymentController.executePayWithStripe);
router.route('/checkout/verifyVoucherCode').post(authorize, paymentController.verifyVoucherCode);
router.route('/checkout/verifyVoucherCodeStripe').post(authorize, paymentController.verifyVoucherCodeStripe);

router.route('/checkout/createCheckoutSession').post(authorize, paymentController.createCheckoutSession);
router.route('/checkout/retrieveCheckoutSession').post(authorize, paymentController.retrieveCheckoutSession);

module.exports = router;
