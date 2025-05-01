const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./model/User')
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken')
const cors = require('cors')
const bodyParser = require('body-parser')
//important
const PORT = process.env.PORT;
const URI = process.env.ATLAS_URI;
const connection = mongoose.connection;

//variables for routes
const overviewRoute = require('./route/overview');
const aiAnalyticsRoute = require('./route/aiAnalytics');
const signupRoute = require('./route/signup');
const loginRoute = require('./route/login');
const sensorRoute = require('./route/sensors');
const scheduleRoute = require('./route/schedules');
const sensorDataRoute = require('./route/sensordata')


const app = express();

//middleware
app.use(cors())
app.use('/api/overview', overviewRoute);
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/sensor', sensorRoute);
app.use('/api/sensordata', sensorDataRoute);
//app.use('/api/Signup', scheduleRoute);
app.use('/api/aianalytics', aiAnalyticsRoute);

app.use(express.json())
app.use(bodyParser.json())


//starts connection
mongoose.connect(URI);
//end

//start listening for when  the connection is open
connection.once('open', () => {
    console.log('database is up')
})
//end


app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`)
})
