const express = require('express')
const router = express.Router()
const User = require('../model/User')
require('dotenv').config()
const JWT = require('jsonwebtoken')
const readAiAnalysis = require('../controller/readAiAnalysis')
const SECRET = process.env.JWT_SECRET 

router.use(express.json())

router.get('/', async (req, res) => {
    const {Token} = req.query
            try {
                const SessionUser = JWT.verify(Token, SECRET)
                const _id = SessionUser.id
                const CurrentUser = await User.findById(_id)
                
                //get analysis of all crops for user
                const allData = require('../AI_MODEL/data.json')
                               
                return res.json({
                    ...allData
                })
                
            }
            catch(err) {
                console.log(err.code)
                return res.json({
                    error : err
                })
            }
})

router.get('/:fruitId', async (req, res) => {
    const { fruitId } = req.params
    const { Token } = req.query
    
            try {
                const SessionUser = JWT.verify(Token, SECRET)
                const _id = SessionUser.id
                const CurrentUser = await User.findById(_id)
                
                //get analysis of selected crop for user
                const data = readAiAnalysis(fruitId)
                
                return res.json({
                    ...data
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