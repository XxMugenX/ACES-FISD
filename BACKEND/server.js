const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User')
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken')
const cors = require('cors')
//important
const PORT = process.env.PORT;
const URI = process.env.ATLAS_URI;
const connection = mongoose.connection;


const overviewRoute = require('./route/overview');
const aiAnalyticsRoute = require('./route/aiAnalytics');
const signupRoute = require('./route/signup');
const loginRoute = require('./route/login');
const sensorRoute = require('./route/sensors');
const scheduleRoute = require('./route/schedules');


const app = express();



//middleware
app.use('/api/', overviewRoute);
app.use('/api/Signup', signupRoute);
app.use('/api/Signup', loginRoute);
app.use('/api/Signup', sensorRoute);
app.use('/api/Signup', scheduleRoute);
app.use('/api/Login', aiAnalyticsRoute);
app.use()
app.use(express.json())


app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
})
