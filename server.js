const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const config = require('./config/app.js');
const compression = require('compression');
const errorHandler = require('express-json-errors');
const middlewareErrorParser = require('./middleware/ErrorParser');
const middlewarePathLogger = require('./middleware/PathLogger');
const path = require('path');
const winston = require('winston');
const fileUpload = require('express-fileupload');
const database = require('./database/index')
const routes = require('./routes');
const OneSignal = require('onesignal-node');
const cron = require('node-cron');
const paypal = require('paypal-rest-sdk');


/*const CLIENT = 'AQ4cbpmlGDKNz3iDpDvFAoiGFhfS73UZJiHBjRBRZ1FLQblD1fBv6R4HYjjjXdrVj-ka39NUXkTUQAvV';
const SECRET = 'EBQysA-YzNPRGc4NTFLNXqlEU0LslegxYZk8PrjbLRSFSWCxgizKYjqudOQ8nBmb3N16c08mK9FwVC2h';
const PAYPAL_API = 'https://api.sandbox.paypal.com';*/
const CLIENT = config.paypalDevClient;
const SECRET = config.paypalDevSecret;
const PAYPAL_API = config.paypalDevApi;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': CLIENT,
    'client_secret': SECRET
});

const app = express();

app.use(express.json({type: "application/json"}));
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    createParentPath: true
}));

// add cors headers
app.use(cors());
// comporess output
app.use(compression());

// only on debug mode
if (config.debug) {
    // path logger
    app.use(middlewarePathLogger);
}

// use routes
app.use('/api/', routes);
// Error Parser Middleware
app.use(middlewareErrorParser);

//Init MongoDB
function startDB() {
    database.init(function (err, db) {
        if (err) {
            winston.error('FETAL: ' + err.message);
            winston.warn('Retrying to connect to MongoDB in 10secs...');
            return setTimeout(function () {
                // database.init();
            }, 10000);
        } else {
            winston.info('MongoDB connected ...');
            // dbCallback(err, db);
        }
    });
}

startDB();

//use pug
// app.set("view engine", "pug");
// app.set("views", path.join(__dirname, "views"));

// Start server
/*
const privateKey = fs.readFileSync(path.join(__dirname, "config/keys", "server.key"), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, "config/keys", "server.crt"), 'utf8');
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(config.port, () => {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});
*/

/*app.listen(config.port, () => {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});*/

app.listen(8000, () => {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
module.exports = app;
