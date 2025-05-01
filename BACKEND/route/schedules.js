const express = require('express')
require('dotenv').config();
const JWT = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/User')
const SECRET = process.env.JWT_SECRET

router.use(express.json())

router.get('/',async (req,res) => {
    const {Token} = req.query

    try {
        const SessionUser = JWT.verify(Token, SECRET)
        const _id = SessionUser.id
        const CurrentUser = await User.findById(_id)
    }
    catch(err) {
        console.log(err.code)
        return res.json({
            error : err
        })
    }
})

module.exports = router