const mongoose = require('mongoose');
const winston = require('winston');
const dbConfig = require('../config/db');

const db = {};

let CONNECTION_URI = dbConfig.mongoURI;

let options = {
    keepAlive: 1,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
};

module.exports.init = function (callback, connectionString, opts) {
    if (connectionString) CONNECTION_URI = connectionString;
    if (opts) options = opts;

    if (db.connection) {
        return callback(null, db);
    }

    global.CONNECTION_URI = CONNECTION_URI;

    mongoose.Promise = global.Promise;
    mongoose.set('useFindAndModify', false);
    mongoose
        .connect(CONNECTION_URI, options)
        .then(function () {
            if (!process.env.FORK) {
                winston.info('Connected to MongoDB');
            }

            db.connection = mongoose.connection;
            mongoose.connection.db
                .admin()
                .command({buildInfo: 1}, function (err, info) {
                    if (err) winston.warn(err.message);
                    db.version = info.version;
                    return callback(null, db);
                });
        })
        .catch(function (e) {
            winston.error('Oh no, something went wrong with DB! - ' + e.message);
            db.connection = null;

            return callback(e, null);
        });
};

module.exports.db = db;
module.exports.connectionuri = CONNECTION_URI;
