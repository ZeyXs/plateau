const allowedOrigins = require('../config/allowedOrigins');

const credentials = function (req, res, next) {
    const origin = req.headers.origin;
    if (Array.from(allowedOrigins).includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
};

module.exports = credentials;
