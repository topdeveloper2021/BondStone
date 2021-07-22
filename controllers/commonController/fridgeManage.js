const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const Fridges = require('../../models/Fridges');
const FridgeType = require('../../models/FridgeType');
const config = require('../../config/app');

// Get Fridges By User ID, not expired ( end date > today )
getFridgeTypes = async (req, res) => {
    try {
        let types = await FridgeType.find({});
        // let typeDocs = types._docs;
        // console.log(typeDocs)
        return res.status(200).json({
            statusCode: 200,
            data: types,
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            error: [{msg: "server_error", errorCode: 'serverError'}],
        })
    }
}

module.exports = {
    getFridgeTypes,
}
