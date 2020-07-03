
const express = require('express')
const router = express.Router()
// const apirouter = require('./api/Routes')
const User = require('../models/userauth')
const middleware = require('../models/middleware')

router.post('/login', [middleware.notloggedin, middleware.redis_client], (req, res) => { User.login(req, res) })
router.post('/register', middleware.notloggedin, (req, res) => { User.register(req, res) })
router.get('/logout', [middleware.verifytoken, middleware.redis_client], (req, res) => { User.logout(req, res) })
router.get('/refresh', middleware.redis_client, (req, res) => { User.refresh(req, res) })

// router.use('/api', apirouter)

// router.use('/', auth.loggedin, (req, res) => {
//     res.render("login.ejs")
// })

module.exports = router;