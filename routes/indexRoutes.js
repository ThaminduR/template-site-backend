
const express = require('express')
const router = express.Router()
// const apirouter = require('./api/Routes')
const User = require('../models/user')
const auth = require('../models/authFunctions')

// router.get('/login', auth.loggedin, (req, res) => { res.send({"code":200,"message":"Already Logged In !"}) })

// router.get('/test',(req, res) => {
//     // bcrypt = require('bcryptjs')
//     // console.log(bcrypt.hashSync('1234', 10))
//     console.log("For testing purposes only")
// })

router.post('/login', auth.notloggedin, (req, res) => { User.login(req, res) })
router.post('/register', auth.notloggedin, (req, res) => { User.register(req, res) })
router.get('/logout', auth.authTokenUser, (req, res) => { User.logout(req, res) })
router.get('/refresh', (req, res) => { auth.refresh(req, res) })
// router.use('/api', apirouter)

// router.use('/', auth.loggedin, (req, res) => {
//     res.render("login.ejs")
// })



module.exports = router;