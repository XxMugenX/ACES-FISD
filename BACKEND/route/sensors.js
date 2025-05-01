const express = require('express')
require('dotenv').config();
const JWT = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/User')
const SECRET = process.env.JWT_SECRET

//middleware
router.use(express.json())

//endpoint for getting readings of selected sensor from the database
router.get('/', async (req, res) => {
    const { Token,sensor } = req.query

        try {
            const SessionUser = JWT.verify(Token, SECRET)
            const _id = SessionUser.id
            const CurrentUser = await User.findById(_id)
            const sensors = []
            const timestamp = Date.now();

            
            for (const i in CurrentUser.SensorData) {
                sensors.push(CurrentUser.SensorData[i])
            }
            sensors.unshift({time: timestamp})
           
            //get values of selected sensor for user
            return res.json({
                 sensors
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