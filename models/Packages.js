const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const COLLECTION = 'packages';
const SALT_ROUND = 10;

// Packages that users have purchased
const packagesSchema = mongoose.Schema({
    uID: {type: String, required: true},
    pID: {type: String, required: true},
    // Number of Fridges
    numberFridges: {type: Number, required: true},
    // Free Trail => 'trial', Normal => 'normal'
    type: {type: String, required: true, default: 'trial'},
    // status : current package
    status: {type: Boolean, required: true, default: true},
    endDate: {type: Date, default: Date.now()},
}, { timestamps: true });

module.exports = mongoose.model(COLLECTION, packagesSchema);
