const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    inbox_id : {
        type : Schema.Types.ObjectId
    },
    user_id : {
        type : String,
        required : true,
        unique : true
    },
    dp:{
        type : String,
        default : "https://cdn.pixabay.com/photo/2014/04/03/10/32/businessman-310819_960_720.png",
    }
}, 
{
    timestamps : true
});

userSchema.plugin(passportLocalMongoose);

var Users = mongoose.model('user', userSchema);

module.exports = Users;