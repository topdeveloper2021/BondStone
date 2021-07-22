const jwt = require('jsonwebtoken');
const ModalUser = require('../models/userModel/user');

const authenticate = (req, res, next) => {
    const authorization = req.headers['authorization'];
    if(authorization){
        const token = authorization.replace('Bearer ','').replace('bearer ','');
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            // console.log('token verify ===> ', token);
            if(decoded){

                return ModalUser.findById(decoded.sub, (err, response) => {
                    if(!err && response){
                        req.user = response;
                        return next();
                    }
                    return res.status(401).send({error: 'Unauthorized', message : 'Authentication failed (token).'});
                });
            }
        } catch (e) {
            console.log(e);
        }

    }

    return res.status(401).send({error: 'Unauthorized', message : 'Authentication failed (token).'});
}

module.exports = authenticate;
