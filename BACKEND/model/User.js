const mongoose = require('mongoose')

const schema = mongoose.Schema;

//usertype

const UserSchema = new schema({
    UserName: {type: String, required: true, unique: true},
    Password: {type: String, required: true},
    FarmName: { type: String, required: true },
    Telephone: {type: String, required: true},
    Email: { type: String, required: true },
   // Data : {}
},
    {collection: "Users"}
)
   const User = mongoose.model('User',UserSchema);

module.exports = User;