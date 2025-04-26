const express = require('express')
const router = express.Router()
const User = require('../model/User')

router.get('/', async (req, res) => {
    const { data } = req.body

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