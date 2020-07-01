
const database = require('../config/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');
const jwtExpirySeconds = 300

db = new database()

exports.register = async function (req, res) {

    first_name = req.body.first_name
    last_name = req.body.last_name
    email = req.body.email
    password = req.body.password

    query = 'SELECT * FROM users WHERE email = ?'

    try {
        results = await db.query(query, [email])
    } catch (err) {
        res.send({
            "code": 400,
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
                "code": 400,
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
            const accessToken = jwt.sign(user, process.env.SECRET, {
                algorithm: "HS256",
                expiresIn: jwtExpirySeconds,
            })
            res.cookie("authtoken", accessToken, { maxAge: jwtExpirySeconds * 1000 })
            res.send({ "code": 200, "failure": "Logging successful" })
            return
        } else {
            res.send({
                "code": 400,
                "failure": "Invalid Credentials !"
            });
            return
        }
    } else {
        res.send({
            "code": 400,
            "failure": "Invalid ID !"
        })
    }
}

exports.logout = function (req, res) {
    res.cookie('authtoken', { maxAge: Date.now() })
    res.send({ "code": 200, "message": "Logged Out" })
}