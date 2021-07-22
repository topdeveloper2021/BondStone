const moment = require('moment')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const VoucherCode = require('../../models/VoucherCode');
const MainPackages = require('../../models/MainPackages');
const config = require('../../config/app');
const {getVoucherCodes} = require('../../service/packageService')

// Create Voucher codes for some main packages
createVoucherCode = async (req, res) => {
    let {code, pID, description, percentage, startDate, endDate} = req.body;
    try {
        for (const p of pID) {
            await VoucherCode.create({
                pID: p,
                code, description, percentage, startDate, endDate
            });
        }
        let resVoucherCodes = await getVoucherCodes();
        return res.status(200).json({
            statusCode: 200,
            data: resVoucherCodes
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Get All Voucher codes
getAllVoucherCodes = async (req, res) => {
    try {
        /*let voucherCodes = await VoucherCode.find({});
        let resVoucherCodes = [];
        for(let code of voucherCodes){
            let codeDoc = code._doc;
            let mPackage = await MainPackages.findOne({_id: code.pID});
            let tmp = {...codeDoc, packageName: mPackage.packageName}
            tmp.startDate = moment(codeDoc.startDate).format('MM/DD/YYYY')
            tmp.endDate = moment(codeDoc.endDate).format('MM/DD/YYYY')
            resVoucherCodes.push(tmp);
        }*/
        let resVoucherCodes = await getVoucherCodes();
        return res.status(200).json({
            statusCode: 200,
            data: resVoucherCodes,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Delete a Voucher code
deleteVoucherCode = async (req, res) => {
    let {_id} = req.body;
    try {
        await VoucherCode.findOneAndDelete({_id});
        let resVoucherCodes = await getVoucherCodes();
        return res.status(200).json({
            statusCode: 200,
            data: resVoucherCodes
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

// Delete a Voucher code
updateVoucherCode = async (req, res) => {
    let {voucherCode} = req.body;
    try {
        await VoucherCode.findOneAndUpdate({_id: voucherCode._id}, voucherCode);
        let resVoucherCodes = await getVoucherCodes();
        return res.status(200).json({
            statusCode: 200,
            data: resVoucherCodes
        });
    } catch (err) {
        winston.error(err.message)
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    createVoucherCode,
    getAllVoucherCodes,
    updateVoucherCode,
    deleteVoucherCode
}
