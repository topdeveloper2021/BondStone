const Joi = require('joi');

const loginParam = {
    body: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().required()
    }
}

const emailParam = {
    body: {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    }
}

module.exports = { loginParam, emailParam };