const config = require('../config/app');
const nodemailer = require('nodemailer');
const winston = require('winston');
const fs = require('fs');

// Sends Email
module.exports.sendEmail = function (mailData) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: config.mailHost,
            port: config.mailPort,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: config.mailUsername,
                pass: config.mailPassword
            }
        });

        transporter.sendMail(mailData, (err, info) => {
            if (err) {
                reject(err)
            } else {
                resolve(true);
            }
        });
    })
};

module.exports.sendEmailWithFile = function (filename, email) {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({
            host: config.mailHost,
            port: config.mailPort,
            secure: false,
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: config.mailUsername,
                pass: config.mailPassword
            },
        });
        const mailOptions = {
            to: email,
            from: config.mailUsername,
            subject: 'Report',
            text: 'Please check attached reported file',
            attachments: [   // define custom content type for the attachment
                {filename: filename, path: './uploads/' + filename},
            ]
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                winston.error(err.message)
                reject(err)
            }
            fs.unlink('./uploads/' + filename, (e) => {
                if (e) {
                    winston.error(e.message)
                    reject(e)
                }
                winston.info('./uploads/' + filename + ' deleted!')
            })
        });
        resolve(true);
    })
};
