const express = require('express');

const publicRouter = require('./public'); // for test

const praviteRouter = require('./private');
const authRouter = require('./authRoute/auth');
const userRouter = require('./userRoute');
const adminRouter = require('./adminRoute');
const commonRouter = require('./commonRoute');

const router = express.Router();

router.use('/', publicRouter);  // for test

router.use('/', authRouter);
router.use('/', userRouter);
router.use('/', adminRouter);
router.use('/', commonRouter);

module.exports = router;
