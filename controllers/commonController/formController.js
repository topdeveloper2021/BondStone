const jwt = require('jsonwebtoken')
const path = require('path');
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const Fridges = require('../../models/Fridges');
const FridgeType = require('../../models/FridgeType');
const config = require('../../config/app');
const {sendEmailWithFile} = require('../../service/mailService');

sendReportByEmail = async (req, res) => {
    let {files} = req;
    let {email, type, filename} = req.body;
    try {
        let report = req.files.report;
        // let rpath = './uploads/' + report.name;
        let today = Date.now()
        let fName = 'report' + today.toString() + '.' + type;
        let rpath = './uploads/' + fName;
        winston.info(rpath + ' created!')
        report.mv(rpath);
        await sendEmailWithFile(fName, email);
        return res.status(200).json({
            statusCode: 200,
            data: {
                file: report,
                email
            },
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    sendReportByEmail,
}
