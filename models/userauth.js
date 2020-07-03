const database = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const jwtExpirySeconds = 15
const jwtRefreshExpirySeconds = 1300000

exports.register = async function (req, res) {

    first_name = req.body.first_name
    last_name = req.body.last_name
    email = req.body.email
    password = req.body.password

    db = new database()
    query = 'SELECT * FROM users WHERE email = ?'

    try {
        results = await db.query(query, [email])
    } catch (err) {
        res.send({
            "code": 500,
            "failed": "error ocurred"
        })
        return
    }

    if (results.length == 0) {
        h_password = bcrypt.hashSync(password, 10)
        user_query = "INSERT INTO users(first_name,last_name,email) VALUES (?,?,?);"
        login_query = "INSERT INTO login_details(email, hpassword) VALUES (?,?);"
        try {
            db.query(user_query, [first_name, last_name, email])
            db.query(login_query, [email, h_password])
            res.send({ "code": 200, "message": "Register Successful" })
        } catch (error) {
            res.send({
                "code": 500,
                "failed": "error while writing user data to database"
            })
        }
    } else {
        res.send({
            "code": 400,
            "failure": "Email Already in Use !"
        })

    }
}

exports.login = async function (req, res) {

    db = new database()
    email = req.body.email
    password = req.body.password
    query = 'SELECT * FROM login_details WHERE email = ?'

    try {
        results = await db.query(query, [email])
    } catch (err) {
        res.send({
            "code": 400,
            "failed": "error ocurred"
        })
        return
    }
    if (results.length > 0) {
        hash = await bcrypt.compare(password, results[0].hpassword)
        if (hash) {

            user = {
                email: email,
            }
            const accessToken = jwt.sign(user, process.env.JWTSECRET, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            })
            const refreshToken = jwt.sign(user, process.env.REFRESHSECRET, {
                algorithm: "HS256",
                expiresIn: jwtRefreshExpirySeconds,
            })
            res.cookie("authtoken", accessToken, { httpOnly: true })
            res.cookie("refreshtoken", refreshToken, { httpOnly: true })

            req.redis.set(email, refreshToken, function (err) {
                if (err) {
                    console.log("Error:", err);
                }
            })

            res.send({ "code": 200, "message": "Logging successful" })
        } else {
            res.send({
                "code": 401,
                "failure": "Invalid Credentials !"
            })
        }
    } else {
        res.send({
            "code": 401,
            "failure": "Invalid ID !"
        })
    }
}

exports.refresh = function (req, res) {

    authtoken = req.cookies['authtoken']
    refreshtoken = req.cookies['refreshtoken']
    try {
        decoded = jwt.verify(authtoken, process.env.JWTSECRET)
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {

            //If the token is expired following ocde is executed
            refreshtokendata = jwt.verify(refreshtoken, process.env.REFRESHSECRET)
            email = refreshtokendata.email
            client = req.redis
            client.get(email, function (err, value) {
                if (err) {
                    console.log(err)
                    res.send({
                        "code": 401,
                        "failure": "Unauthorized Access !"
                    })
                } else {
                    if (value == refreshtoken) {
                        user = {
                            email: email,
                        }
                        const accessToken = jwt.sign(user, process.env.JWTSECRET, {
                            algorithm: "HS256",
                            expiresIn: jwtExpirySeconds,
                        })
                        res.cookie("authtoken", accessToken, { httpOnly: true })
                        res.send({ "code": 200, "message": "Logging successful" })
                    }
                    else {
                        res.send({
                            "code": 401,
                            "failure": "Unauthorized Access !"
                        })
                    }
                }
            })
        } else {
            res.send({
                "code": 401,
                "failure": "Unauthorized Access !"
            })
            return
        }
    }
}

exports.logout = function (req, res) {
    refreshtoken = req.cookies['refreshtoken']
    client = req.redis
    decoded = jwt.verify(refreshtoken, process.env.REFRESHSECRET)
    client.del(decoded.email);
    res.cookie('authtoken', { maxAge: Date.now() })
    res.cookie('refreshtoken', { maxAge: Date.now() })
    res.send({ "code": 200, "message": "Logged Out" })
}