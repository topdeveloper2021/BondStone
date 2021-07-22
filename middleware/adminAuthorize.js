const jwt = require('jsonwebtoken')
const User = require('../models/User');

const adminAuthorize = async (req, res, next) => {
    const authorization = req.headers['authorization'];
    if (authorization) {
        const token = authorization.replace('Bearer ', '').replace('bearer ', '');
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            if (!decoded)
                return res.status(500).json({
                    statusCode: 500,
                    error: [{msg: "Authorize Error", errorCode: 'authorizeError'}],
                })
            let user = await User.findOne({token});
            if (user.role !== 'admin')
                return res.status(500).json({
                    statusCode: 500,
                    error: [{msg: "Not Admin Role", errorCode: 'notAdmin'}],
                })
            return next();
        } catch (e) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: "Authorize Error", errorCode: 'authorizeError'}],
            })
        }
    }

    return res.status(401).send({error: 'Unauthorized', message: 'Authentication failed (token).'});
}

module.exports = adminAuthorize;
