const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');

const COLLECTION = 'users';
const SALT_ROUND = 10;

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    name: {type: String, default: ''},
    surname: {type: String, default: ''},
    role: {type: String, required: true, default: "user"},
    phoneNumber: {type: String, default: null},
    address: {type: String, default: ''},
    company: {type: String, default: ''},
    city: {type: String, default: ''},
    nation: {type: String, default: ''},
    cap: {type: String, default: ''},
    status: {type: Boolean, default: true},
    // user who has a subscription
    active: {type: Boolean, default: false},
    token: {type: String, sparse: true, select: false, default: ''},
}, { timestamps: true });

userSchema.pre('save', function (next) {
    let user = this;
    if (!user.isModified('password')) {
        return next();
    }
    /*user.username = user.username.toLowerCase().trim();
    user.email = user.email.trim();
    if (user.fullname) user.fullname = user.fullname.trim();
    if (user.title) user.title = user.title.trim();

    if (!user.isModified('password')) {
        return next();
    }*/

    let date = Date.now();
    // user.createdAt = date;

    bcrypt.genSalt(SALT_ROUND, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            return next();
        });
    });
});

module.exports = mongoose.model(COLLECTION, userSchema);
