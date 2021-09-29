var express = require('express');
var initialRouter = express.Router();

const authenticate = require('../authenticate');

const Users = require('../schemas/users');
const Inbox = require('../schemas/inbox');
const Chats = require('../schemas/chats');

initialRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {//get all the users
  Users.find()
  .then(resp => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(resp);
  })
  .catch(err => next(err)); 
})
//creating a new user has been shifted to other route
// .post((req,res,next) => {//creating a new user
//   var id;//req.body = {username : "" , user_id : " ", password : ""}
//   Inbox.create({user_id : req.body.user_id})
//   .then(resp => {
//     id = resp._id;
//     Users.create({username : req.body.username, user_id : req.body.user_id, inbox_id : id, password : req.body.password})
//   .then(resp => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.json(resp);
//   })
//   .catch(err => next(err));
//   })
// })
// .delete((req,res) => {//deleting all the users
//   res.send("Dangerous Thing to be done");
// })



//////////////////////////////////////////////////////////////////////////////////////////

initialRouter.route('/:userId')
.get(authenticate.verifyUser, (req,res, next) => {//getting the user data
  Users.findOne({user_id : req.params.userId})
  .then(user => {
    res.statusCode = 200;
    res.setHeader("Content-Type", 'application/json');
    res.json(user);
  })
  .catch(err => next(err)); 
})
.delete(authenticate.verifyUser, (req,res,next) => { //deleting the user
  res.statusCode = 403;
  res.end("Deleting Account Not Supported");
  // Inbox.findOne({user_id : req.params.userId})
  // .then(inbox => {
  //   for(let i=0; i<inbox.rooms.length; i++)
  //   {
  //     let contact = inbox.rooms[i].contact_id;
  //     Inbox.findOne({user_id : contact})
  //     .then(data => {
  //       for(let j=0; j<data.rooms.length; j++)
  //       {
  //         if(data.rooms[i].contact_id === req.params.userId)
  //         {
  //           data.rooms[i].room_name = "Deleted Account";
  //         }
  //       }
  //       data.save()
  //     })
  //   }
  //   inbox.save()
  // })

  // Inbox.deleteOne({user_id : req.params.userId})
  // Users.deleteOne({user_id : req.params.userId})
  // .then(user => {
  //   res.json(user);
  // })
})

initialRouter.route('/:userId/inbox') //I think here the post of  new room should be done
.get(authenticate.verifyUser, (req,res,next) => {
  Inbox.findOne({user_id : req.params.userId})
  .then(resp => {
    res.statusCode = 200;
    res.setHeader("Content-Type", 'application/json');
    res.json(resp.rooms);
  })
})
.post(authenticate.verifyUser, (req,res,next) => { //creating a chat room with given contact_id
  var id; //{contact_id : ""}
  var user_name;
  var contact_name; 
  //var room_data;
  Users.findOne({user_id : req.params.userId})
  .then(resp => {
    user_name = resp.username;
  })
  Users.findOne({user_id : req.body.contact_id})
  .then(resp => {
    //console.log(resp);
    if(resp == null){
      res.statusCode = 404;
      res.setHeader("Content-Type", 'application/json');
      res.json({info : "The contact id doesnt exists"});
      next(new Error("Alredy exists"))
    }else
    contact_name = resp.username;
  })
  Chats.create({})
  .then(resp => {
    id = resp._id;//req.body = {contact_id : " "}
    Inbox.findOne({user_id : req.params.userId})
    .then(inbox => {
      inbox.rooms.push({ contact_id : req.body.contact_id, _id : id, room_name : contact_name} );
      inbox.save()
      Inbox.findOne({user_id : req.body.contact_id})
      .then(inbox => {
        if(inbox == null){
        res.statusCode = 404;
        res.setHeader("Content-Type", 'application/json');
        res.json({info : "The contact id doesnt exists"});
      }
        inbox.rooms.push({_id : id , contact_id : req.params.userId, room_name : user_name});
        inbox.save()
        .then((resp) => {
          Inbox.findOne({user_id: req.params.userId})
          .then(resp => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp.rooms);
          })
        })
      })
    })
  })
  .catch(err => next(err))
})

initialRouter.route('/:userId/inbox/:roomId')
.get(authenticate.verifyUser, (req,res,next) => {  //getting the chat using _id of the room in inbox
  Chats.findById(req.params.roomId)
  .then(chat => {
    res.statusCode = 200;
    res.setHeader("Content-Type", 'application/json');
    res.json(chat);
  })
})
.post(authenticate.verifyUser, (req,res,next) => {
  var author_id = req.params.userId; // "content" = ""
  var contact;
  Chats.findById(req.params.roomId)
  .then(chat => {
    chat.messages.push({content : req.body.content, author : author_id})
    chat.save()
    .then(resp => {
      Inbox.findOne({user_id : req.params.userId})
      .then(inbox => {
        contact = inbox.rooms.id(req.params.roomId).contact_id;
        inbox.rooms.id(req.params.roomId).last_message = req.body.content;
        inbox.save()
        .then(resp => {
          Inbox.findOne({user_id : contact})
          .then(inbox => {
            inbox.rooms.id(req.params.roomId).last_message = req.body.content;
            inbox.save()
            .then(data => {
              Chats.findOne({_id : req.params.roomId})
              .then(chat => {
                console.log(data)
                res.statusCode = 200;
                res.setHeader("Content-Type", 'application/json');
                res.json({chat, contact});
              })
          })
        })
        })
      })
    })
  })
})
.put(authenticate.verifyUser, (req,res,next) => {
  res.statusCode = 403;
  res.end("Not allowed");
})
.delete(authenticate.verifyUser, (req,res,next) => { //delete messages of specified chat
  var contact;
  Chats.findById(req.params.roomId) //in the request body you will send the contact id
  .then(chat => {
    chat.messages = [];
    chat.save()
  })
  Inbox.findOne({user_id : req.params.userId})
  .then(inbox => {
    contact = inbox.rooms.id(req.params.roomId).contact_id;
    inbox.rooms.id(req.params.roomId).last_message = "";
    inbox.save()
    Inbox.findOne({user_id : contact})
    .then(inbox => {
      inbox.rooms.id(req.params.roomId).last_message = "";
      inbox.save()
      .then(data => {
      res.statusCode = 200;
      res.setHeader("Content-Type", 'application/json');
      res.json({status : "Deleted the chat!!"});
    })
    })
  })
  .catch(err => next(err));
})


module.exports = initialRouter;