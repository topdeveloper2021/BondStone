const moment = require('moment');
var paypal = require('paypal-rest-sdk');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const MainPackages = require('../../models/MainPackages');
const VoucherCode = require('../../models/VoucherCode');
const Packages = require('../../models/Packages');
const PurchaseHistory = require('../../models/PurchaseHistory');
const config = require('../../config/app');
// const stripe = require('stripe')('sk_test_51HDpb6BE9q7fomtlA3QEUPBPaOrVR80y71lOfDODpOqfyaf1SchwdNMZe8kfH1nOxH1CP4Cb35f3dsp391mpJzwR00m5Im02a8');
const stripe = require('stripe')(config.stripeDevToken);

var CLIENT = 'AQ4cbpmlGDKNz3iDpDvFAoiGFhfS73UZJiHBjRBRZ1FLQblD1fBv6R4HYjjjXdrVj-ka39NUXkTUQAvV';
var SECRET = 'EBQysA-YzNPRGc4NTFLNXqlEU0LslegxYZk8PrjbLRSFSWCxgizKYjqudOQ8nBmb3N16c08mK9FwVC2h';
var PAYPAL_API = 'https://api.sandbox.paypal.com';

verifyVoucherCode = async (req, res) => {
    let {code} = req.body;
    try {
        let vCode = await VoucherCode.findOne({code});
        if (!vCode) {
            winston.error(vCode);
            return res.status(404).json({
                statusCode: 404,
                error: [{msg: "NotFoundError", errorCode: 'notFoundError'}],
            })
        }
        const sign = {
            exp: Math.floor(Date.now() / 1000) + 1200, // expire time
            sub: code,      // Identifies the subject of the JWT.
        };
        let token = jwt.sign(sign, config.jwtSecret);
        return res.status(200).json({
            statusCode: 200,
            data: token,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

verifyVoucherCodeStripe = async (req, res) => {
    let {code} = req.body;
    try {
        let vCode = await VoucherCode.findOne({code});
        if (!vCode) {
            winston.error(vCode);
            return res.status(404).json({
                statusCode: 404,
                error: [{msg: "NotFoundError", errorCode: 'notFoundError'}],
            })
        }
        const sign = {
            exp: Math.floor(Date.now() / 1000) + 1200, // expire time
            sub: code,      // Identifies the subject of the JWT.
        };
        let token = jwt.sign(sign, config.jwtSecret);
        return res.status(200).json({
            statusCode: 200,
            data: {token, vCode},
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

createPaymentWithPaypal = async (req, res) => {
    let {_id, vtoken} = req.body;
    console.log(vtoken)
    try {
        let voucherItem = null;
        let decoded = null;
        if (vtoken !== '')
            decoded = jwt.verify(vtoken, config.jwtSecret);
        let mPackage = await MainPackages.findOne({_id});
        let price = parseFloat(mPackage.price).toFixed(2);
        let discount = 0;
        if (decoded) {
            let code = decoded.sub;
            let vCode = await VoucherCode.findOne({code});
            let today = moment();
            let endDate = moment(mPackage.endDate);
            // console.log(vCode, mPackage)
            if (!vCode || vCode.pID !== _id || today > endDate) {
                voucherItem = null;
            } else {
                discount = (price * parseFloat(vCode.percentage) / 100).toFixed(2);
                voucherItem = {
                    name: vCode.description,
                    description: vCode.percentage + "% Off",
                    quantity: "1",
                    price: -discount,
                    sku: "vouch1",
                    currency: "EUR"
                }
            }
        }
        console.log(price, discount, voucherItem)
        let payReq = {
            intent: 'sale',
            // currency: 'EUR',
            payer: {
                payment_method: 'paypal'
            },
            transactions: [{
                amount: {
                    total: price - discount,
                    // total: "20.00",
                    currency: "EUR",
                },
                item_list: {
                    items: [
                        {
                            name: mPackage.packageName,
                            description: mPackage.numberFridges + " Frigoriferi",
                            quantity: "1",
                            price: price,
                            // price: "25.00",
                            sku: "1",
                            currency: "EUR"
                        }
                    ]
                }
            }],
            redirect_urls: {
                return_url: 'https://example.com',
                cancel_url: 'https://example.com'
            }
        };
        console.log(JSON.stringify(payReq))
        if (voucherItem) payReq.transactions[0].item_list.items.push(voucherItem);
        paypal.payment.create(payReq, function (err, payment) {
            if (err) {
                winston.error(err.message);
                return res.status(500).json({
                    statusCode: 500,
                    error: [{msg: "server_error", errorCode: 'serverError'}],
                })
            } else {
                return res.status(200).json({
                    statusCode: 200,
                    data: {id: payment.id},
                });
            }
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

executePayWithPaypal = (req, res) => {
    let {paymentID, payerID, _id, uID} = req.body;
    console.log(uID);
    const details = {"payer_id": payerID};
    const payment = paypal.payment.execute(paymentID, details, async (err, payment) => {
        if (err) {
            winston.error(err.message);
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: err.message, errorCode: 'serverError'}],
            })
        }
        console.log('paypal payment ======> ', payment)
        await createHistory(_id, uID);
        return res.status(200).json({
            statusCode: 200,
            data: payment,
        });
    });
}

executePayWithStripe = async (req, res) => {
    let {stripeToken, vtoken, _id, uID} = req.body;
    console.log(uID);
    try {
        let decoded = null
        if (vtoken !== '')
            decoded = jwt.verify(vtoken, config.jwtSecret);
        // const decoded = jwt.verify(vtoken, config.jwtSecret);
        let mPackage = await MainPackages.findOne({_id});
        let price = parseFloat(mPackage.price).toFixed(2);
        let discount = 0;
        let vCode = null;
        if (decoded) {
            let code = decoded.sub;
            vCode = await VoucherCode.findOne({code});
            let today = moment();
            let endDate = moment(mPackage.endDate);
            // console.log(vCode, mPackage)
            if (!vCode || vCode.pID !== _id || today > endDate) {
                // voucherItem = null;
                discount = 0;
            } else {
                discount = (price * parseFloat(vCode.percentage) / 100).toFixed(2);
            }
        }
        console.log(price, discount)
        let totalPrice = parseInt((price - discount) * 100)
        let resData = {
            packageItem: {
                name: mPackage.packageName,
                description: mPackage.numberFridges + ' Frigoriferi',
                price: mPackage.price,
            },
            totalPrice: price - discount,
            voucherItem: null
        };
        if(discount) {
            resData.voucherItem = {
                name: vCode.description,
                description: vCode.percentage + "% Off",
                price: -discount,
            }
        }
        let charge = await stripe.charges.create({
            card: stripeToken,
            currency: 'eur',
            amount: totalPrice,
            description: mPackage.packageName
        });
        await createHistory(_id, uID);
        return res.status(200).json({
            statusCode: 200,
            data: resData,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

createHistory = async (pID, uID) => {
    try {
        let endDate = new Date();
        let mainPackage = await MainPackages.findOne({_id: pID});
        endDate.setDate(endDate.getDate() + mainPackage.period);
        let curPackage = await Packages.findOne({uID, status: true});
        if(curPackage) {
            curPackage.status = false
            curPackage.save();
        }
        let package = await Packages.create({
            uID: uID,
            pID: pID,
            numberFridges: mainPackage.numberFridges,
            type: mainPackage.type,
            endDate
        });
        console.log(package)
        let pHistory = await PurchaseHistory.create({
            uID: uID,
            pID: pID,
        });
        winston.info('created!');
    } catch (e) {
        winston.error(e.message)
    }
}

////////////////////////////////////////////////////////////////
createCheckoutSession = async (req, res) => {
    // let {stripeToken, _id} = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            locale: 'it',
            line_items: [
                {
                    // price: "price_H5ggYwtDq4fbrJ",
                    amount: 1300,
                    quantity: 1,
                    currency: 'eur',
                    name: 'Crio'
                    // description: 'Description000'
                },
                {
                    // price: "price_H5ggYwtDq4fbrJ",
                    amount: 500,
                    quantity: 1,
                    currency: 'eur',
                    name: 'Crio'
                    // description: 'Description000'
                },
            ],
            // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
            success_url: `http://localhost:8080/dashboard/purchase`,
            cancel_url: `http://localhost:8080/dashboard/purchase`,
        });
        return res.status(200).json({
            statusCode: 200,
            data: session,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}
retrieveCheckoutSession = async (req, res) => {
    let {sessionId} = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return res.status(200).json({
            statusCode: 200,
            data: session,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}
///////////////////////////////////////////////////////////////

module.exports = {
    createPaymentWithPaypal,
    executePayWithPaypal,
    verifyVoucherCode,
    verifyVoucherCodeStripe,
    executePayWithStripe,

    createCheckoutSession,
    retrieveCheckoutSession
}
