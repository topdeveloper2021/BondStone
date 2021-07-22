const jwt = require('jsonwebtoken')
const packageService = require('../service/packageService')
const User = require('../models/User');

const authorize = async (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (authorization) {
        const token = authorization.replace('Bearer ', '').replace('bearer ', '');
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            if (decoded) {
                let user = await User.findOne({token})
                if (!user)
                    return res.status(500).json({
                        statusCode: 500,
                        error: [{msg: 'Account does not exist', errorCode: 'notExist'}],
                    });
                let uID = user._id;
                await packageService.updatePackageStatus(uID)
                return next();
            } else
                return res.status(500).json({
                    statusCode: 500,
                    error: [{msg: "authorize error", errorCode: 'authorizeError'}],
                })
        } catch (e) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: "authorize error", errorCode: 'authorizeError'}],
            })
        }
    }

    return res.status(401).send({error: 'Unauthorized', message: 'Authentication failed (token).'});
}

module.exports = authorize;
