const mongoose = require('mongoose')

const schema = mongoose.Schema;

const UserSchema = new schema({
    UserName: {type: String, required: true, unique: true},
    Password: {type: String, required: true},
    FarmName: { type: String, required: true },
    Telephone: {type: Number, required: true},
    Email: { type: String, required: true },
    SensorData: {
        tempSensor : {type: Number},
        soilMoistureSensor : {type: Number},
        humiditySensor : {type: Number},
        phSensor : {type: Number},
        motionSensor : {type: Boolean}
    }
    //DateCreated
},
    {collection: "Users"}
)
   const User = mongoose.model('User',UserSchema);

module.exports = User;