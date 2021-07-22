const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../models/User');
const Fridges = require('../models/Fridges');
const Packages = require('../models/Packages');
const MainPackages = require('../models/MainPackages');
const History = require('../models/History');
const FridgeStatus = require('../models/FridgeStatus');
const FridgeType = require('../models/FridgeType');
const config = require('../config/app');

// Get Fridges By User ID, not expired ( end date > today )
getAllFridges = async (uID) => {
    // let {uID} = req.body;
    try {
        let curDate = Date.now();
        let packages = await Packages.find({uID: uID, endDate: {$gt: curDate}});
        let allFridges = [];
        for (const package of packages) {
            let fridges = await Fridges.find({uID: uID, pID: package._id});
            allFridges.push(...fridges);
        }
        // Get Status for today
        const today = moment().startOf('day')
        let tmpFridges = [];
        for (const fridge of allFridges) {
            let history = await History.findOne({
                uID,
                fID: fridge._id,
                date: {
                    $gte: today.toDate(),
                    $lte: moment(today).endOf('day').toDate()
                }
            });
            let fType = await FridgeType.findOne({_id: fridge.type});
            // console.log(fridge)
            let tmpFridge = fridge._doc;
            tmpFridge.status = history.status;
            // tmpFridge.type = fType.title;
            tmpFridge.typeTitle = fType.title;
            tmpFridges.push(tmpFridge);
            // console.log(tmpFridges)
        }
        /*return res.status(200).json({
            statusCode: 200,
            data: tmpFridges,
        });*/
        return tmpFridges;
    } catch (err) {
        return null;
        /*res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })*/
    }
}

module.exports = {
    getAllFridges,
}
