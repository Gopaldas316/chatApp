const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
    room_name : {
        type : String,
    },
    room_id : {
        type : Schema.Types.ObjectId,
    },
    last_message : {
        type : String,
    },
    contact_id : {
        type : String,
        required : true,
    }
})

const InboxSchema = new Schema({
    user_id : {
        type : String,
        required : true
    },
    rooms : [RoomSchema]
})

var Inbox = mongoose.model('inbox', InboxSchema);

module.exports = Inbox;