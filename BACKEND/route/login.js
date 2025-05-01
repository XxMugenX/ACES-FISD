const express = require('express')
require('dotenv').config()
const router = express.Router()
const JWT = require('jsonwebtoken')
const bcrypt = require ('bcryptjs')
const User = require('../model/User')
const SECRET = process.env.JWT_SECRET

router.use(express.json())

//login endpoint
router.post('/',async (req,res) => {
    const { UserName, password } = req.body;
    
    const user = await User.findOne({UserName}).lean();

if(!user) {
    return res.json({
        status : 'error',
        error : 'Incorrect Username/Password'
    })
}

if(await bcrypt.compare(password, user.Password)) {
    const token = JWT.sign({
        id: user._id,
        UserName : user.UserName
    }, SECRET)

    return res.json({
        status : 'ok',
        Token : token
    })
} 
else {
    return res.json({
        status : 'error',
        error : 'Incorrect Username/Password'
    })
}

})



module.exports = router