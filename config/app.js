require('dotenv').config();

let env = process.env.NODE_ENV || 'development';

config = {
    // App env
    env: process.env.NODE_ENV,

    // App debug mode
    debug: process.env.DEBUG ? process.env.DEBUG === 'true' : true,

    // App secret for password encoding
    appSecret: process.env.APP_SECRET || "itsverysecret",

    // Server port
    port: process.env.SERVER_PORT || 8000,

    // JWT secret
    jwtSecret: process.env.JWT_SECRET || "itsverysecret",

    // JWT expire time in seconds
    jwtExpire: parseInt(process.env.JWT_EXPIRE, 10) || 300,

    //Email Service
    mailHost: process.env.MAIL_HOST || "mail.crioon.com",
    mailPort: parseInt(process.env.MAIL_PORT) || 587,
    mailUsername: process.env.MAIL_USERNAME || "no-reply@crioon.com",
    mailPassword: process.env.MAIL_PASSWORD || "test123test",

    // Notification Service (OneSignal)
    appId: process.env.APP_ID,
    apiKey: process.env.API_KEY,

    //Payment
    paypalDevClient: process.env.PAYPAL_DEV_CLIENT,
    paypalDevSecret: process.env.PAYPAL_DEV_SECRET,
    paypalDevApi: process.env.PAYPAL_DEV_API,
    paypalProClient: process.env.PAYPAL_CLIENT,
    paypalProSecret: process.env.PAYPAL_SECRET,
    paypalProApi: process.env.PAYPAL_API,
    // stripeToken
    stripeDevToken: process.env.STRIPE_DEV_TOKEN,
    stripeProToken: process.env.STRIPE_PRO_TOKEN,
}

module.exports = config;
