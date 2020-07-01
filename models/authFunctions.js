const jwt = require('jsonwebtoken')

exports.authTokenUser = function (req, res, next) {
    const token = req.cookies["authtoken"]

    if (token == null) return res.send({ "code": 401, "failure": "Please Login" })

    jwt.verify(token, process.env.SECRET, (err, user) => {
        if (err) {
            res.send({
                "code": 401,
                "failure": "Please Login"
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
        jwt.verify(token, process.env.SECRET, (err, user) => {
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

exports.refresh = function (req, res) {
    const token = req.cookies['authtoken']

    if (token == null) return res.send({ "code": 401, "failure": "Please Login" })

    var payload

    try {
		payload = jwt.verify(token, jwtKey)
	} catch (e) {
		if (e instanceof jwt.JsonWebTokenError) {
			return res.status(401).end()
		}
		return res.status(400).end()
	}

    const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
	if (payload.exp - nowUnixSeconds > 30) {
		return res.status(400).end()
	}

	// Now, create a new token for the current user, with a renewed expiration time
	const newToken = jwt.sign({ username: payload.username }, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
	})

	// Set the new token as the users `token` cookie
	res.cookie("token", newToken, { maxAge: jwtExpirySeconds * 1000 })
	res.end()

} 