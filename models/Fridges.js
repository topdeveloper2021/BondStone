const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'fridges';
const SALT_ROUND = 10;

// Fridges that users have created under their package purchased
const fridgeSchema = mongoose.Schema({
    uID: {type: String, required: true},
    pID: {type: String, required: true},
    name: {type: String, default: ''},
    type: {type: String, default: ''},
    maintenanceDay: {type: Array, default: []},
    note: {type: String, default: ''},
    // Enable/disable
    active: {type: Boolean, default: true},
    company: {type: String, default: ''},
    city: {type: String, default: ''},
    country: {type: String, default: ''},
    postalCode: {type: String, default: ''},
    password: {type: String, default: ''},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, fridgeSchema);
