const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const moment = require('moment')
const config = require('../config/app');
const User = require('../models/User');
const Packages = require('../models/Packages');
const MainPackages = require('../models/MainPackages');
const Fridges = require('../models/Fridges');
const FridgeType = require('../models/FridgeType');
const History = require('../models/History');
const mongoose = require('mongoose');

const OneSignal = require('onesignal-node');
const cron = require('node-cron');

let globals = require('./Constants');
const { getActiveUsers } = require('./adminController/statisticsController');

testController = async (req, res) => {
    try {
        /*let user = await User.find({});
        console.log('user', user);*/
        /*let user = await User.findOne({_id: '5f316c01ebb68613f00b90c5'});
        let mainPackage = await MainPackages.create({
            packageName: 'Free Trial',
            numberFridges: 3,
            period: 5,
            price: 35.64
        });
        // Packages that users have purchased
        let endDate = new Date();
        endDate.setDate(endDate.getDate() + mainPackage.period);
        let package = await Packages.create({
            uID: user._id,
            pID: mainPackage._id,
            endDate
        });
        // Fridges that users have created under their package purchased
        let fridge = await Fridges.create({
            uID: user._id,
            pID: package._id,
            name: 'Test Fridge',
        });
        // History for each fridges
        let history = await History.create({
            uID: user._id,
            fID: fridge._id,
            status: 0
        });
        res.json({
            user, history, mainPackage, package, fridge
        })*/
        // let types = await FridgeType.create({title: "TN + 2 / + 4"});
        // console.log(moment().startOf('day'), moment().endOf('day'))
        /*const today = moment().startOf('day')
        let history = await History.findOne({
            date: {
                $gte: today.toDate(),
                $lte: moment(today).endOf('day').toDate()
            }
        })*/

        // Notification
        const notification = {
            contents: {
                'tr': 'Yeni bildirim',
                'en': 'First!!! Hello, How are you ? I am Backend!',
            },
            // included_segments: ['Subscribed Users'],
            include_player_ids: ['0cf092d0-ac38-4b47-a803-d520fabe152c'],
        };
        const client = new OneSignal.Client('6c2f867d-9396-4632-98c9-bafd229880d3', 'MDY4NDY2YzItY2ZlOC00ZmMyLWExMDItZjFkYWMzYjg5MGJk');

        let task = cron.schedule('*/2 * * * * *', () =>  {
            // console.log('stopped task', task);
            client.createNotification(notification)
                .then(response => {
                    winston.info('first notification sent!!!')
                })
                .catch(e => {
                    winston.error('first notification faild!!!', e)
                });
        }, {
            scheduled: false
        });

        task.start();

        global.jobs['123456'] = task
        console.log('jobs ==> ', global)
        global.jobs['123456'].start();
        /*        globals.jobs['123456'].destroy()
        console.log('===========>',globals.jobs['123456'])*/
        res.json({
            data: 'success'
        })
    } catch (error) {
        winston.error(error);
        res.status(500).json({
            error: error
        })
    }
}

createBaseDB = async (req, res) => {
    try{
        let startAdmin = await User.create({
            name: 'Test Admin',
            surname: 'Test',
            password: '123456',
            email: 'admin@test.com',
            role: 'admin'
        })
        /*User.create({
            name: 'Test User',
            surname: 'User',
            password: '123456',
            email: 'user@test.com',
        })*/
        let trialPackage = await MainPackages.create({
            packageName: "Trial Package",
            period: 8,                  // x days
            periodQty: 8,               // amount of period
            periodUnit: "day",          // unit of period (e.g. period = [periodQty] [periodUnit])
            numberFridges: 3,
            price: "0",
            type: "trial"
        })
        await FridgeType.create({title: "TN 0/+2"});
        await FridgeType.create({title: "TN +2/+4"});
        await FridgeType.create({title: "TN +4/+8"});
        await FridgeType.create({title: "BT -10/-12"});
        await FridgeType.create({title: "BT -18/-20"});

        let startFridgeTypes = await FridgeType.find({});

        return res.status(200).json({
            statusCode: 200,
            data: "Sucess!",
            startAdmin: startAdmin,
            trialPackage: trialPackage,
            startFridgeTypes: startFridgeTypes
        });
    }catch(err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'serverError'}],
        });
    }
}

clearDB = async (req, res) => {
    try{
        /*await User.deleteMany({});
        await MainPackages.deleteMany({});
        await FridgeType.deleteMany({});*/
        await mongoose.connection.db.dropDatabase();
        return res.status(200).json({
            statusCode: 200,
            data: "Success!"
        });
    }catch(err){
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    testController,
    createBaseDB,
    clearDB
}
