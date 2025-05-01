const express = require('express')
require('dotenv').config();
const JWT = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/User')
const SECRET = process.env.JWT_SECRET

router.use(express.json())

//endpoint for sending sensor data to database
router.post('/', async (req, res) => {
    const {Token,data} =  req.body

    try {
        //user verification
        const SessionUser = JWT.verify(Token, SECRET)
        const _id = SessionUser.id
        const CurrentUser = await User.findByIdAndUpdate(_id,
            { SensorData: data },
            {
                new: true,
                upsert : true
            })
        
        return res.json({
            message : "ok"
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