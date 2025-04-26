const express = require('express')
const router = express.Router()
const bcrypt = require ('bcryptjs')
const User = require('../model/User')

router.post('/', async (req,res) => {
    const{
        UserName, password:plainTextPassword,
        Email, Telephone, FarmName
    } = req.body;

//password validation
    if(typeof plainTextPassword !== 'string') {
        return res.json({
            status : 'error',
            errormessage : 'invalid password',
            errortype : 'password'
        })
    }

    if(plainTextPassword.length < 6 || plainTextPassword.length == null) {
        return res.json({
            status : error,
            errormessage : 'length must be 6 or more',
            errortype : 'password'
        })
    }
 

    //password hashing
    const password = await bcrypt.hash(plainTextPassword,12)


    //username validation
    if(!UserName || typeof UserName !== 'string' || UserName === null) {
        return res.json({
            status : 'error',
            errormessage : 'Invalid username',
            errortype : 'username'
        })
    }
    
    //create user account
    try{
        const NewUser = await User.create({
            FarmName: FarmName,
            Email: Email,
            Telephone: Telephone,
            Password: password,
            UserName: UserName,
    })
        console.log("Signup successful", NewUser)
    } catch(err) {
        if (err.code === 11000) {
            return res.json({
                error: 'Username is already in use'
            });
        }
        throw err;
    }
        res.json({
            status: 'ok'
        })  
}) 
module.exports = router