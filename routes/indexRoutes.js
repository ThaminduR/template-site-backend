const express = require('express')
const router = express.Router()
// const apirouter = require('./api/Routes')
const auth = require('../models/userauth')
const middleware = require('../models/middleware')
const userrouter = require('./api/userRoutes')
const adminrouter = require('./api/adminRoutes')

router.post('/login', [middleware.notloggedin, middleware.redis_client], (req, res) => { auth.login(req, res) })
router.post('/register', middleware.notloggedin, (req, res) => { auth.register(req, res) })
router.get('/logout', [middleware.verifytoken, middleware.redis_client], (req, res) => { auth.logout(req, res) })
router.get('/refresh', middleware.redis_client, (req, res) => { auth.refresh(req, res) })

router.use('/user', userrouter)
router.use('/admin', adminrouter)

// router.use('/', auth.loggedin, (req, res) => {
//     res.render("login.ejs")
// })

module.exports = router;