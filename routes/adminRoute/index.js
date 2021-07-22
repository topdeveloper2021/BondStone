const express = require('express');
const router = express.Router();
const validate = require('express-validation');
const adminController = require('../../controllers/adminController/adminController');
const voucherController = require('../../controllers/adminController/voucherController');
const statisticsController = require('../../controllers/adminController/statisticsController');
const packageController = require('../../controllers/userController/packageController');
const authValidation = require('../../validations/auth');
const adminAuthorize = require('../../middleware/adminAuthorize');

router.route('/admin/getAllUsers').post(adminAuthorize, adminController.getAllUsers);
router.route('/admin/getAllAdmins').post(adminAuthorize, adminController.getAllAdmins);
router.route('/admin/deleteUser').post(adminAuthorize, adminController.deleteUser);
router.route('/admin/searchUsers').post(adminAuthorize, adminController.searchUsers);
router.route('/admin/setUserStatus').post(adminAuthorize, adminController.setUserStatus);
router.route('/admin/resetEmailPassword').post(adminAuthorize, adminController.resetEmailPassword);
router.get('/admin/getAllPackages', adminAuthorize, adminController.getAllPackages);
router.route('/admin/createMainPackage').post(adminAuthorize, adminController.createMainPackage);
router.route('/admin/deleteMainPackage').post(adminAuthorize, adminController.deleteMainPackage);
router.route('/admin/updateMainPackage').post(adminAuthorize, adminController.updateMainPackage);
router.route('/admin/getNumberFridges').post(adminAuthorize, adminController.getNumberFridges);
router.route('/admin/upgradePackage').post(adminAuthorize, adminController.upgradePackage);
router.route('/admin/createNewUser').post(adminAuthorize, adminController.createNewUser);
router.route('/admin/createNewAdmin').post(adminAuthorize, adminController.createNewAdmin);

/*router.route('/admin/getTotalUsers').get(adminAuthorize, statisticsController.getTotalUsers);
router.route('/admin/getActiveUsers').get(adminAuthorize, statisticsController.getActiveUsers);
router.route('/admin/getRegisteredUsersThisWeek').get(adminAuthorize, statisticsController.getRegisteredUsersThisWeek);
router.route('/admin/getEnabledUsers').get(adminAuthorize, statisticsController.getEnabledUsers);
router.route('/admin/getTotalSales').get(adminAuthorize, statisticsController.getTotalSales);
router.route('/admin/getSalesThisWeek').get(adminAuthorize, statisticsController.getSalesThisWeek);
router.route('/admin/getPurchaseHistory').get(adminAuthorize, statisticsController.getPurchaseHistory);*/
router.get('/admin/getTotalUsers',adminAuthorize, statisticsController.getTotalUsers);
router.get('/admin/getActiveUsers',adminAuthorize, statisticsController.getActiveUsers);
router.get('/admin/getRegisteredUsersThisWeek',adminAuthorize, statisticsController.getRegisteredUsersThisWeek);
router.get('/admin/getEnabledUsers',adminAuthorize, statisticsController.getEnabledUsers);
router.get('/admin/getTotalSales',adminAuthorize, statisticsController.getTotalSales);
router.get('/admin/getSalesThisWeek',adminAuthorize, statisticsController.getSalesThisWeek);
router.get('/admin/getPurchaseHistory',adminAuthorize, statisticsController.getPurchaseHistory);

router.route('/admin/createVoucherCode').post(adminAuthorize, voucherController.createVoucherCode);
router.route('/admin/updateVoucherCode').post(adminAuthorize, voucherController.updateVoucherCode);
router.route('/admin/deleteVoucherCode').post(adminAuthorize, voucherController.deleteVoucherCode);
router.get('/admin/getAllVoucherCodes', adminAuthorize, voucherController.getAllVoucherCodes);

module.exports = router;
