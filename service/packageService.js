const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const moment = require('moment');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../models/User');
const Fridges = require('../models/Fridges');
const Packages = require('../models/Packages');
const MainPackages = require('../models/MainPackages');
const VoucherCode = require('../models/VoucherCode');
const History = require('../models/History');
const FridgeStatus = require('../models/FridgeStatus');
const config = require('../config/app');

// Get Fridges By User ID, not expired ( end date > today )
createTrialPackage = async (uID) => {
    try {
        let curDate = moment();
        let trialPackage = await MainPackages.findOne({type: 'trial'});
        await Packages.create({
            uID: uID,
            pID: trialPackage._id,
            numberFridges: trialPackage.numberFridges,
            endDate: curDate.add(trialPackage.period, 'days')
        })
    } catch (err) {
        return null;
    }
}

getVoucherCodes = async () => {
    try{
        let voucherCodes = await VoucherCode.find({});
        let resVoucherCodes = [];
        for(let code of voucherCodes){
            let codeDoc = code._doc;
            let mPackage = await MainPackages.findOne({_id: code.pID});
            let tmp = {...codeDoc, packageName: mPackage.packageName}
            tmp.startDate = moment(codeDoc.startDate).format('MM/DD/YYYY')
            tmp.endDate = moment(codeDoc.endDate).format('MM/DD/YYYY')
            resVoucherCodes.push(tmp);
        }
        return resVoucherCodes;
    }catch (e) {
        return null;
    }
}

updatePackageStatus = async (uID) => {
    try{
        let curPackage = await Packages.findOne({status: true, uID});
        let curDate = Date.now();
        if(curPackage){
            if(curDate > curPackage.endDate){
                curPackage.status = false;
                curPackage.save();
            }
        }
        return true;
    }catch (e) {
        return null;
    }
}

module.exports = {
    createTrialPackage,
    getVoucherCodes,
    updatePackageStatus
}
