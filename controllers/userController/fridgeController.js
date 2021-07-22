const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const Fridges = require('../../models/Fridges');
const Packages = require('../../models/Packages');
const MainPackages = require('../../models/MainPackages');
const History = require('../../models/History');
const FridgeStatus = require('../../models/FridgeStatus');
const config = require('../../config/app');
const fridgeService = require('../../service/fridgeService')
const globalConstants = require('../Constants')

// Get Fridges By User ID, not expired ( end date > today )
getAllFridges = async (req, res) => {
    let {uID} = req.body;
    try {
        /*let curDate = Date.now();
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
            let tmpFridge = fridge;
            tmpFridge.status = history.status;
            tmpFridges.push(tmpFridge);
        }*/
        let tmpFridges = await fridgeService.getAllFridges(uID);
        return res.status(200).json({
            statusCode: 200,
            data: tmpFridges,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Create A Fridge under current Package
createFridge = async (req, res) => {
    let {name, type, maintenanceDay, note, uID} = req.body;
    try {
        let user = await User.findOne({_id: uID});
        let curPackage = await Packages.findOne({uID: uID, status: true});
        if (!curPackage)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Not found available package', errorCode: 'notFound'}]
            });
        /*let mainPackage = await MainPackages.findOne({_id: curPackage.pID})*/
        let curFridges = await Fridges.find({uID: uID, pID: curPackage._id});
        let fridgeCount = curFridges.length;
        // let fridgeCount = curPackage.numberFridges;
        // console.log('current fridge number ==> ', fridgeCount, mainPackage.numberFridges)
        if (fridgeCount >= curPackage.numberFridges)
            return res.status(201).json({
                statusCode: 201,
                error: [{msg: 'Cannot create package anymore.', errorCode: 'overflow'}]
            });
        let createdFridge = await Fridges.create({
            name, type, maintenanceDay, note, uID,
            pID: curPackage._id,
            company: user.company,
            city: user.city,
            country: user.nation,
            postalCode: user.cap,
        });
        // Update fridge count ( FridgeStatus )
        await FridgeStatus.create({
            uID: uID,
            pID: curPackage._id,
            count: fridgeCount + 1
        });
        // Initialize History for this fridge ( from createdDate to endDate )
        let curDate = moment();
        let endDate = curPackage.endDate;
        for (let m = moment(curDate); m.isBefore(endDate); m.add(1, 'days')) {
            // console.log(m.format('YYYY-MM-DD'));
            let history = await History.create({
                uID,
                fID: createdFridge._id,
                date: m
            });
        }
        let tmpFridges = await fridgeService.getAllFridges(uID);
        return res.status(200).json({
            statusCode: 200,
            data: tmpFridges
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Update A Fridge By _id
updateFridge = async (req, res) => {
    let {name, type, maintenanceDay, note, _id, uID} = req.body;
    try {
        await Fridges.findOneAndUpdate({_id}, {
            name, type, maintenanceDay, note,
        });
        let tmpFridges = await fridgeService.getAllFridges(uID);
        return res.status(200).json({
            statusCode: 200,
            data: tmpFridges
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Update A Fridge Activation By _id
updateFridgeActivaion = async (req, res) => {
    let {_id, active} = req.body;
    try {
        await Fridges.findOneAndUpdate({_id}, {
            active
        });
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Delete A Fridge By _id
deleteFridge = async (req, res) => {
    let {uID, _id} = req.body;
    try {
        await Fridges.findOneAndDelete({_id});
        await History.deleteMany({uID: uID, fID: _id})
        let tmpFridges = await fridgeService.getAllFridges(uID);
        return res.status(200).json({
            statusCode: 200,
            data: tmpFridges
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Manage Multiple Refrigerators for multiple days
updateHistory = async (req, res) => {
    let {dates, fridges, status, uID} = req.body;
    try {
        for (const d of dates) {
            for (const f of fridges) {
                console.log(d, f)
                await History.findOneAndUpdate({
                    uID,
                    fID: f,
                    date: {
                        $gte: moment(d).startOf('day').toDate(),
                        $lte: moment(d).endOf('day').toDate()
                    }
                }, {
                    status: status
                });
            }
        }
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Manage Multiple Refrigerators for multiple days
updateHistoryForToday = async (req, res) => {
    let {uID} = req.body;
    try {
        let fridges = await Fridges.find({uID, active: true});
        let today = moment();
        for (const f of fridges) {
            // console.log(today.weekday(), f.maintenanceDay, f.maintenanceDay.includes(today.weekday()))
            if (!f.maintenanceDay.includes(today.weekday())) {
                await History.findOneAndUpdate({
                    uID,
                    fID: f._id,
                    date: {
                        $gte: today.startOf('day').toDate(),
                        $lte: today.endOf('day').toDate()
                    }
                }, {
                    status: 0
                });
            } else {
                await History.findOneAndUpdate({
                    uID,
                    fID: f._id,
                    date: {
                        $gte: today.startOf('day').toDate(),
                        $lte: today.endOf('day').toDate()
                    }
                }, {
                    status: 1
                });
            }
        }
        let tmpFridges = await fridgeService.getAllFridges(uID);
        return res.status(200).json({
            statusCode: 200,
            data: tmpFridges
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

// Get History for multiple fridges for multiple days
getHistory = async (req, res) => {
    let {fridges, dates, uID} = req.body;
    try {
        let startDate = '';
        let endDate = '';
        if (dates.length === 1) {
            startDate = dates[0];
            endDate = dates[0];
        } else {
            startDate = dates[0] > dates[1] ? dates[1] : dates[0];
            endDate = dates[0] < dates[1] ? dates[1] : dates[0];
        }
        let history = [];
        for (let d = moment(startDate); d.isSameOrBefore(moment(endDate)); d.add(1, ("days"))) {
            for (const f of fridges) {
                let tmpFridge = await Fridges.findOne({_id: f});
                let tmp = await History.findOne({
                    uID,
                    fID: f,
                    date: {
                        $gte: moment(d).startOf('day').toDate(),
                        $lte: moment(d).endOf('day').toDate()
                    }
                });
                let tmpHistory = {};
                tmpHistory.date = moment(d).format('DD/MM/YYYY');
                tmpHistory.name = tmpFridge.name;
                tmpHistory.note = tmpFridge.note;
                if (tmp) {
                    tmpHistory.status = globalConstants.fridgeStatus[tmp.status];
                } else {
                    tmpHistory.status = 'Not Available';
                }
                history.push(tmpHistory)
            }
        }
        return res.status(200).json({
            statusCode: 200,
            data: history
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

module.exports = {
    getAllFridges,
    createFridge,
    updateFridge,
    updateFridgeActivaion,
    deleteFridge,
    updateHistory,
    getHistory,
    updateHistoryForToday
}
