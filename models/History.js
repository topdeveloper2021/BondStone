const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'history';
const SALT_ROUND = 10;

// History for each fridges per day
const historySchema = mongoose.Schema({
    uID: {type: String, required: true},
    fID: {type: String, required: true},
    date: {type: Date, default: Date.now()},
    // status { 0: Active, 1: cleaning, 2: Under maintenance, 3: Off }
    status: {type: Number, default: 0},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, historySchema);
