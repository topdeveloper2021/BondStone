const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'fridgeType';
const SALT_ROUND = 10;

// Selling Packages that Admin created
const fridgeTypeSchema = mongoose.Schema({
    title: {type: String, required: true, unique: true},
}, {timestamps: true});

module.exports = mongoose.model(COLLECTION, fridgeTypeSchema);
