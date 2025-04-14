const JwtConfic = require('./jwt-config');
const JWT = require('jsonwebtoken');

let checkToken = (req, res, next) => {
    let userToken = req.headers["authorization"];

    if(userToken){
        JWT.verify(userToken, JwtConfic.secret, {
            algorithms: JwtConfic.algorithm
        }, (error, data) => {
            if(error){
                return res.status(500).json({
                    status: 0,
                    data: error,
                    message: "Token is not valid"
                });
            }else{
                req.user = data;
                next();
            }
        })
    }else{
        return res.status(500).json({
            status: 0,
            message: "Please provide authorization token value"
        });
    }
}

module.exports = {
    checkToken: checkToken
}