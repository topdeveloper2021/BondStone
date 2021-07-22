const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const winston = require('winston');
const randomstring = require('randomstring');
const User = require('../../models/User');
const config = require('../../config/app');
const {sendEmailVerification} = require('../../service/auth')
const {sendEmail} = require('../../service/mailService');
const packageService = require('../../service/packageService')

/**
 * Returns jwt token if valid email and password is provided
 * @param req
 * @param res
 * @returns {*}
 */

login = async (req, res) => {
    const {email, password} = req.body;
    try {
        let user = await User.findOne({
            email: email
        }).select('password').exec();
        if (!user) {
            return res.status(401).json({
                statusCode: 401,
                error: [{msg: 'auth_cannot_find_user', errorCode: 'noUser'}],
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                statusCode: 401,
                error: [{
                    msg: 'auth_invalid_credential',
                    errorCode: 'invalidCredentials',
                }],
            });
        }
        const sign = {
            // exp: Math.floor(Date.now() / 1000) + config.jwtExpire, // expire time
            sub: user._id,                                          // Identifies the subject of the JWT.
        };
        let token = jwt.sign(sign, config.jwtSecret);
        user.token = token;
        user.save();
        user = await User.findOne({email: email});
        if(!user.status)
            return res.status(201).json({
                statusCode: 201,
                error: [{
                    msg: 'disabled_user',
                    errorCode: 'disabledUser',
                }],
            });
        return res.status(200).json({
            statusCode: 200,
            data: {
                id: user._id,
                token: token,
                currentUser: user,
            },
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: "auth_server_error", errorCode: 'serverError'}],
        });
    }
}

checkExist = async (req, res) => {
    let {name, email} = req.body;
    try {
        let user = await User.findOne({email});
        // console.log(name, email, user);
        if (user) {
            return res.status(201).json({
                statusCode: 201,
                error: [{msg: 'Email Duplicated', errorCode: 'registerError'}],
            });
        } else {
            let code = await sendEmailVerification(name, email);
            if (!code)
                return res.status(500).json({
                    statusCode: 500,
                    error: [{msg: 'Send Verify Email Failed', errorCode: 'registerError'}],
                });
            // let code = '12345'; // Test Code
            const sign = {
                exp: Math.floor(Date.now() / 1000) + config.jwtExpire, // expire time
                sub: code,      // Identifies the subject of the JWT.
            };
            let token = jwt.sign(sign, config.jwtSecret);
            return res.status(200).json({
                statusCode: 200,
                data: {
                    token: token
                }
            });
        }
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'registerError'}],
        });
    }
}

register = async (req, res) => {
    let {token, code, name, email, password} = req.body;
    // console.log(token, code, name, email, password)
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        // console.log('Code ===> ', decoded, code);
        if (!decoded)
            return res.status(201).json({
                statusCode: 201,
                error: [{msg: 'Code Expired', errorCode: 'expiredVerify'}],
            });
        if (decoded.sub !== code)
            return res.status(201).json({
                statusCode: 201,
                error: [{msg: 'Code Invalid', errorCode: 'invalidCode'}],
            });
        let createdUser = await User.create({
            name: name,
            email: email,
            password: password
        });
        winston.info("created " + createdUser);
        const sign = {
            // exp: Math.floor(Date.now() / 1000) + config.jwtExpire, // expire time
            sub: createdUser._id,                                          // Identifies the subject of the JWT.
        };
        await packageService.createTrialPackage(createdUser._id);
        let reToken = jwt.sign(sign, config.jwtSecret);
        createdUser.token = reToken;
        createdUser.save();
        return res.status(200).json({
            statusCode: 200,
            data: {
                id: createdUser._id,
                token: reToken,
                user: createdUser
            },
        })
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'registerError'}],
        });
    }

}

/**
 * reset password ( reset password )
 * $method GET
 * @param req: token, oldPassword, newPassword
 * @param res:
 */

canResetPassword = async (req, res) => {
    let {token, oldPassword} = req.body;
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Credential Expired', errorCode: 'expired'}],
            });
        }
        let user = await User.findOne({token}).select('password').exec();
        if (!user)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Account does not exist', errorCode: 'notExist'}],
            });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(500).json({
                statusCode: 500,
                error: [{
                    msg: 'auth_invalid_password',
                    errorCode: 'invalidPassword',
                }],
            });
        }
        user = await User.findOne({token});
        let code = await sendEmailVerification(user.name, user.email);
        if (!code)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Send Verify Email Failed', errorCode: 'networkError'}],
            });
        // let code = '12345'; // Test Code
        const sign = {
            exp: Math.floor(Date.now() / 1000) + config.jwtExpire, // expire time
            sub: code,      // Identifies the subject of the JWT.
        };
        let newToken = jwt.sign(sign, config.jwtSecret);
        return res.status(200).json({
            statusCode: 200,
            data: {
                token: newToken
            }
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'resetError'}],
        });
    }
}

resetPassword = async (req, res) => {
    let {token, newToken, code, oldPassword, newPassword} = req.body;
    try {
        const decoded = jwt.verify(newToken, config.jwtSecret);
        if (!decoded) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Credential Expired', errorCode: 'expired'}],
            });
        }
        if (decoded.sub !== code)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Code Invalid', errorCode: 'invalidCode'}],
            });
        let user = await User.findOne({token}).select('password').exec();
        if (!user)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Account does not exist', errorCode: 'notExist'}],
            });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(500).json({
                statusCode: 500,
                error: [{
                    msg: 'auth_invalid_password',
                    errorCode: 'invalidPassword',
                }],
            });
        }
        user.password = newPassword;
        user.save();
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (e) {
        winston.error(e.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: e.message, errorCode: 'resetError'}],
        });
    }
}

forgotPassword = async (req, res) => {
    let {email} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Account does not exist', errorCode: 'notExist'}],
            });
        const newPassword = randomstring.generate(10);
        const msg = {
            to: email,
            from: 'no-reply@crioon.com',
            subject: 'New Password',
            text: 'Your password was renewed.',
            html: `<strong>Your current new password: </strong>${newPassword}
                    <br>If you have any question please contact <a href="https://www.support.com">us</a>>.`,
            // template_id: config.sendgridTemplate.emailVerification,
        };
        await sendEmail(msg);
        user.password = newPassword;
        // user.password = '123456';
        user.save();
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

/*
* Clear all tokens
* */
logout = (req, res) => {
    let {token} = req.body;
    try {
        jwt.destroy(token);
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

getCurrentUser = async (req, res) => {
    let {token} = req.body;
    try {
        let user = await User.findOne({token});
        if (!user)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Account does not exist', errorCode: 'notExist'}],
            });
        /*let uID = user._id;
        await packageService.updatePackageStatus(uID)*/
        return res.status(200).json({
            statusCode: 200,
            data: {
                currentUser: user,
            }
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'forgotError'}],
        });
    }
}

canUpdateProfile = async (req, res) => {
    let {token, oldEmail} = req.body;
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Credential Expired', errorCode: 'expired'}],
            });
        }
        let user = await User.findOne({token});
        let code = await sendEmailVerification(user.name, oldEmail);
        if (!code)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Send Verify Email Failed', errorCode: 'networkError'}],
            });
        // let code = '12345'; // Test Code
        const sign = {
            exp: Math.floor(Date.now() / 1000) + config.jwtExpire, // expire time
            sub: code,      // Identifies the subject of the JWT.
        };
        let newToken = jwt.sign(sign, config.jwtSecret);
        return res.status(200).json({
            statusCode: 200,
            data: {
                token: newToken
            }
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'resetError'}],
        });
    }
}
/*

updateProfile = async (req, res) => {
    let {token, code, profile} = req.body;
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Credential Expired', errorCode: 'expired'}],
            });
        }
        if (decoded.sub !== code)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Code Invalid', errorCode: 'invalidCode'}],
            });
        await User.findOneAndUpdate({token: profile.token}, profile);
        return res.status(200).json({
            statusCode: 200,
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'resetError'}],
        });
    }
}
*/

updateProfile = async (req, res) => {
    let {profile} = req.body;
    try {
        /*const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded) {
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Credential Expired', errorCode: 'expired'}],
            });
        }
        if (decoded.sub !== code)
            return res.status(500).json({
                statusCode: 500,
                error: [{msg: 'Code Invalid', errorCode: 'invalidCode'}],
            });*/
        await User.findOneAndUpdate({token: profile.token}, profile);
        let user = await User.findOne({token: profile.token});
        return res.status(200).json({
            statusCode: 200,
            data: user
        });
    } catch (err) {
        winston.error(err.message);
        return res.status(500).json({
            statusCode: 500,
            error: [{msg: err.message, errorCode: 'resetError'}],
        });
    }
}

/**
 * Returns user info
 * @param req
 * @param res
 * @returns {*}
 */
function me(req, res) {
    res.json({
        message: "success",
        data: req.user
    });
}

module.exports = {
    login,
    register,
    checkExist,
    canResetPassword,
    resetPassword,
    forgotPassword,
    logout,
    getCurrentUser,
    canUpdateProfile,
    updateProfile,
    me
};
