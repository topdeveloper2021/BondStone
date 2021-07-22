const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const moment = require('moment');
const randomstring = require('randomstring');
const VoucherCode = require('../../models/VoucherCode');
const User = require('../../models/User');
const Packages = require('../../models/Packages');
const MainPackages = require('../../models/MainPackages');
const config = require('../../config/app');

// Get All Users
getTotalUsers = async (req, res) => {
    try {
        let totalUsers = await User.countDocuments({});
        return res.status(200).json({
            statusCode: 200,
            data: totalUsers
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Active Users(subscribed user)
getActiveUsers = async (req, res) => {
    try {
        let activeUsers = await User.countDocuments({active: true});
        return res.status(200).json({
            statusCode: 200,
            data: activeUsers
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Active Users(subscribed user)
getRegisteredUsersThisWeek = async (req, res) => {
    try {
        const from_date = moment();
        from_date.subtract(6, 'days')
        let to_date = moment();
        // console.log(from_date, to_date)
        let weekCount = [];
        for (let m = from_date; m.isSameOrBefore(to_date); m.add(1, 'days')) {
            // console.log(m.toString())
            let cnt = await User.countDocuments({
                // active: true,
                createdAt: {
                    $gte: moment(m).startOf('day').toDate(),
                    $lte: moment(m).endOf('day').toDate()
                }
            });
            weekCount.push(cnt)
        }
        return res.status(200).json({
            statusCode: 200,
            data: weekCount
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Active Users(subscribed user)
/*getEnabledUsersThisWeek = async (req, res) => {
    try {
        const from_date = moment();
        from_date.subtract(7, 'days')
        let to_date = moment();
        console.log(from_date, to_date)
        let weekCount = [];
        for (let m = from_date; m.isBefore(to_date); m.add(1, 'days')) {
            console.log(m.toString())
            let cnt = await User.countDocuments({
                active: true,
                createdAt: {
                    $gte: moment(m).startOf('day').toDate(),
                    $lte: moment(m).endOf('day').toDate()
                }
            });
            weekCount.push(cnt)
        }
        return res.status(200).json({
            statusCode: 200,
            data: weekCount
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}*/

// Get All Enabled Users
getEnabledUsers = async (req, res) => {
    try {
        let activeUsers = await User.countDocuments({status: true});
        return res.status(200).json({
            statusCode: 200,
            data: activeUsers
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Enabled Users
getTotalSales = async (req, res) => {
    try {
        let totalSales = await Packages.countDocuments({type: {$ne: 'trial'}});
        return res.status(200).json({
            statusCode: 200,
            data: totalSales
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Active Users(subscribed user)
getSalesThisWeek = async (req, res) => {
    try {
        const from_date = moment();
        from_date.subtract(6, 'days')
        let to_date = moment();
        // console.log(from_date, to_date)
        let weekCount = [];
        for (let m = from_date; m.isSameOrBefore(to_date); m.add(1, 'days')) {
            // console.log(m.toString())
            let cnt = await Packages.countDocuments({
                // active: true,
                type: {$ne: 'trial'},
                createdAt: {
                    $gte: moment(m).startOf('day').toDate(),
                    $lte: moment(m).endOf('day').toDate()
                }
            });
            weekCount.push(cnt)
        }
        return res.status(200).json({
            statusCode: 200,
            data: weekCount
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get Purchase History
getPurchaseHistory = async (req, res) => {
    try {
        let packageHistory = await Packages.find({});
        let purchaseHistory = [];
        for (let history of packageHistory) {
            let user = await User.findOne({_id: history.uID});
            if (user) {
                let mainPackage = await MainPackages.findOne({_id: history.pID});
                let tmp = {};
                tmp.username = user.name;
                tmp.address = user.address;
                tmp.company = user.company;
                tmp.nation = user.nation;
                tmp.packageName = mainPackage.packageName;
                tmp.period = mainPackage.period;
                tmp.price = mainPackage.price;
                tmp.type = history.type;
                tmp.numberFridges = history.numberFridges;
                tmp.endDate = history.endDate;
                tmp.startDate = history.createdAt;
                // let tmp = {...history, ...user, ...mainPackage};
                purchaseHistory.push(tmp);
            }
        }
        return res.status(200).json({
            statusCode: 200,
            data: purchaseHistory
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    getTotalUsers,
    getActiveUsers,
    getEnabledUsers,
    getTotalSales,
    getRegisteredUsersThisWeek,
    getSalesThisWeek,
    getPurchaseHistory
    // getEnabledUsersThisWeek
}
