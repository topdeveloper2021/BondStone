const randomstring = require("randomstring");
const {sendEmail} = require('./mailService');
const config = require('../config/app');

sendEmailVerification = async (name, email) => {
    try {
        const emailToken = randomstring.generate(5);
        const msg = {
            to: email,
            from: config.mailUsername,
            subject: 'Email Verify',
            text: 'Please verify your email.',
            html: `<strong>Verification Code: </strong>${emailToken}`,
        };
        await sendEmail(msg);
        return emailToken;
    }catch (e) {
        return false;
    }
}

module.exports = {sendEmailVerification};
