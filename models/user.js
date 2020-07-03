const database = require('../config/db')

exports.test = function (req, res) {
    console.log('Route Response')
    res.send({
        'code': 200,
        'message': "Success"
    })
}