const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'mainPackages';
const SALT_ROUND = 10;

// Selling Packages that Admin created
const mainPackagesSchema = mongoose.Schema({
    packageName: {type: String, required: true, unique: true},
    period: {type: Number, required: true, default: 14},
    periodQty: {type: Number, required: true, default: 2},
    // Unit: 0: day, 1: week, 2: month, 3: year
    periodUnit: {type: String, required: true, default: 'week'},
    numberFridges: {type: Number, required: true},
    price: {type: String, required: true, default: '0'},
    // Free Trail => 'trial', Normal => 'normal'
    type: {type: String, required: true, default: 'normal'},
}, {timestamps: true});

module.exports = mongoose.model(COLLECTION, mainPackagesSchema);
