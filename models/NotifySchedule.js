const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'notifySchedule';
const SALT_ROUND = 10;

// History for each fridges per day
const notifyScheduleSchema = mongoose.Schema({
    uID: {type: String, required: true},
    playerID: {type: String, default: ''},
    notifyTime: {type: String, required: true},
    notifyDays: {type: Array, required: true},
    registered: {type: Boolean, default: false},
    status: {type: Boolean, default: false},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, notifyScheduleSchema);
