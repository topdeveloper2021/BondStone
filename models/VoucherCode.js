const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'voucherCode';
const SALT_ROUND = 10;

// How many fridges the user created under certain Package
const voucherCodeSchema = mongoose.Schema({
    pID: {type: String, required: true},
    code: {type: String, required: true},
    description: {type: String},
    percentage: {type: String, required: true},
    // period: {type: Number, required: true, default: 10},
    startDate: {type: Date, required: true, default: Date.now()},
    endDate: {type: Date, required: true, default: Date.now()},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, voucherCodeSchema);
