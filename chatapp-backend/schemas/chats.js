const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    messages : [
        {
            content : {
                type : String,
                required : true,
            },
            author : {
                type : String,
                required: true
            }
        }
    ]
})

var Chats = mongoose.model('chat', ChatSchema);

module.exports = Chats;