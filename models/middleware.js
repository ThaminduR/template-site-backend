const jwt = require('jsonwebtoken')
const redis = require('redis')


//Install redis on pc and run redis-server command to start the server
//Redis client is created in this file as server will only occasionally query the db.
exports.redis_client = function (req, res, next) {
    const Client = redis.createClient();
    req.redis = Client;
    next();
}

exports.verifytoken = function (req, res, next) {
    const token = req.cookies["authtoken"]

    if (token == null) return res.send({ "code": 401, "failure": "Unauthorized Access" })

    jwt.verify(token, process.env.JWTSECRET, (err, user) => {
        if (err) {
            res.send({
                "code": 401,
                "failure": "Unauthorized Access"
            })
        } else {
            next()

        }
    })
}

exports.notloggedin = function (req, res, next) {
    const token = req.cookies['authtoken']
    if (token == null) {
        next()
    } else {
        jwt.verify(token, process.env.JWTSECRET, (err, user) => {
            if (err) {
                next()
            } else {
                if (user.user_type == "user") {
                    res.send({
                        "code": 200,
                        "failure": "Logged In"
                    })
                }
            }
        })
    }
}

