const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const Fridges = require('../../models/Fridges');
const FridgeStatus = require('../../models/FridgeStatus');
const Packages = require('../../models/Packages');
const MainPackages = require('../../models/MainPackages');
const History = require('../../models/History');
const PurchaseHistory = require('../../models/PurchaseHistory');
const config = require('../../config/app');
const packageService = require('../../service/packageService')

// Get All Users
getAllUsers = async (req, res) => {
    try {
        let users = await User.find({role: 'user'})
        return res.status(200).json({
            statusCode: 200,
            data: users,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}
// Get All Admins
getAllAdmins = async (req, res) => {
    let {token} = req.body;
    try {
        let users = await User.find({token: {$ne: token}, role: 'admin'})
        return res.status(200).json({
            statusCode: 200,
            data: users,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Create New User
createNewUser = async (req, res) => {
    let {newUser} = req.body;
    try {
        let createdUser = await User.create(newUser);
        await packageService.createTrialPackage(createdUser._id);
        let users = await User.find({role: 'user'});
        return res.status(200).json({
            statusCode: 200,
            data: users,
        });
    } catch (err) {
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}
// Create Another New User
createNewAdmin = async (req, res) => {
    let {token, newAdmin} = req.body;
    try {
        let createdUser = await User.create(newAdmin);
        // await packageService.createTrialPackage(createdUser._id);
        let users = await User.find({role: 'admin', token: {$ne: token}});
        return res.status(200).json({
            statusCode: 200,
            data: users,
        });
    } catch (err) {
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Create Another New User
deleteUser = async (req, res) => {
    let {token, _id} = req.body;
    try {
        let user = await User.findOneAndDelete({_id});
        let users = [];
        if (user.role === 'admin') {
            users = await User.find({token: {$ne: token}, role: 'admin'})
        } else if (user.role === 'user') {
            await Packages.deleteMany({uID: _id});
            await Fridges.deleteMany({uID: _id});
            await FridgeStatus.deleteMany({uID: _id});
            await History.deleteMany({uID: _id});
            await PurchaseHistory.deleteMany({uID: _id});
            users = await User.find({role: 'user'})
        }
        return res.status(200).json({
            statusCode: 200,
            data: users,
        });
    } catch (err) {
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

/**
 * Search Users
 * param e.g.
 * {
 *     name: {$regex: 'Test', $option: "i"},
 *     email: {$regex: 'test@test.com', $option: "i"}
 *     ...
 * }
 */
searchUsers = async (req, res) => {
    let {filter} = req.body;
    try {
        let users = await User.find(filter);
        return res.status(200).json({
            statusCode: 200,
            data: users
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'networkError'}],
        });
    }
}

// Set User Status
setUserStatus = async (req, res) => {
    let {status, _id} = req.body;
    try {
        await User.findOneAndUpdate({_id}, {status})
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

// Reset Password
resetEmailPassword = async (req, res) => {
    let {newEmail, newPassword, _id} = req.body;
    try {
        let user = await User.findOne({_id});
        user.password = newPassword;
        user.email = newEmail;
        user.save();
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

// Get All Packages
getAllPackages = async (req, res) => {
    try {
        let packages = await MainPackages.find({});
        return res.status(200).json({
            statusCode: 200,
            data: packages,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Update A Package
createMainPackage = async (req, res) => {
    let {newPackage} = req.body;
    try {
        await MainPackages.create(newPackage);
        let packages = await MainPackages.find({});
        return res.status(200).json({
            statusCode: 200,
            data: packages,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Delete A Package
deleteMainPackage = async (req, res) => {
    let {_id} = req.body;
    try {
        await MainPackages.findOneAndDelete({_id});
        let packages = await MainPackages.find({});
        return res.status(200).json({
            statusCode: 200,
            data: packages,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Update A Package
updateMainPackage = async (req, res) => {
    let {mainPackage} = req.body;
    try {
        await MainPackages.findOneAndUpdate({_id: mainPackage._id}, mainPackage);
        let packages = await MainPackages.find({});
        return res.status(200).json({
            statusCode: 200,
            data: packages,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get Number of Packages for a User
getNumberFridges = async (req, res) => {
    let {uID} = req.body;
    try {
        let curPackage = await Packages.findOne({uID, status: true});
        return res.status(200).json({
            statusCode: 200,
            data: curPackage,
        });
    } catch (err) {
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}
// Increase Number of Packages for a User
upgradePackage = async (req, res) => {
    let {uID, numberFridges} = req.body;
    try {
        await Packages.findOneAndUpdate({uID, status: true}, {numberFridges});
        let curPackage = await Packages.findOne({uID, status: true});
        return res.status(200).json({
            statusCode: 200,
            data: curPackage,
        });
    } catch (err) {
        winston.error(err.message);
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    getAllUsers,
    getAllAdmins,
    searchUsers,
    setUserStatus,
    resetEmailPassword,
    getAllPackages,
    createMainPackage,
    deleteMainPackage,
    updateMainPackage,
    getNumberFridges,
    upgradePackage,
    createNewUser,
    createNewAdmin,
    deleteUser
}
