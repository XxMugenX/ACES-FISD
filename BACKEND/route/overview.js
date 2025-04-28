const express = require('express')
require('dotenv').config();
const JWT = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/User')
const SECRET = process.env.JWT_SECRET

router.get('/',async (req,res) => {
    const {Token} =  req.body

    try {
        const SessionUser = JWT.verify(Token, SECRET)
        const _id = CurrentUser.id
        const CurrentUser = await User.findById(_id)

        //get sensor variables, ai insights and schedule/tasks for user
        return res.json({

        })
        
    }
    catch(err) {
        console.log(err.code)
        return res.json({
            error : err
        })
    }
})


module.exports = router