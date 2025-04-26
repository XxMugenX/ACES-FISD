const express = require('express')
const router = express.Router()
const User = require('../model/User')
require('dotenv').config()
const JWT = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET 

router.get('/', async (req, res) => {
    
            try {
                const SessionUser = JWT.verify(Token, SECRET)
                const _id = CurrentUser.id
                const CurrentUser = await User.findById(_id)
        
                //get values of available sensor for user
                //data in json form?
                return res.json({
                     data : data
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