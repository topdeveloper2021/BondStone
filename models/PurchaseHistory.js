const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'purchaseHistory';
const SALT_ROUND = 10;

// History of Sales
const purchaseHistorySchema = mongoose.Schema({
    uID: {type: String, required: true},
    pID: {type: String, required: true},
    date: {type: Date, default: Date.now()},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, purchaseHistorySchema);
