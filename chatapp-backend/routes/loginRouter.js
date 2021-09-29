var express = require('express');
var loginRouter = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');

const Users = require('../schemas/users');
const Inbox = require('../schemas/inbox');

loginRouter.route('/signup')
.post((req,res,next) => { //signing up // {username : "", password : "", user_id : ""}
    console.log(req.body);
    Users.register(new Users({username : req.body.username, user_id : req.body.user_id}), req.body.password, (err, user) => {
        if(err){ // if error exists
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err : err});
        }
        else{
            passport.authenticate('local')(req, res, () => {
                const token = authenticate.getToken({_id : req.user._id});
                Inbox.create({user_id : req.body.user_id})
                .then(resp => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success : true, status : "Registration Successful !!", token : token});
                })
            })
        }
    })
})

loginRouter.route('/login')
.post(passport.authenticate('local'), (req,res,next) => {
    const token = authenticate.getToken({_id : req.user._id}); //getting the token //after getting authorized by passport we would have req.user
    let user_id;
    Users.findOne({_id : req.user._id})
    .then(user=>{
        console.log(user);
        user_id = user.user_id;
        res.statusCode = 200;
        res.setHeader("Content-Type", 'application/json');
        res.json({success : true ,token : token , status : 'You are successfully Logged in !!', user_id : user_id }); 
    })
    // sending the token to the user as token
})

loginRouter.route('/logout')
.get((req,res,next) => {
    res.send("Will get you logged out")
}) 

module.exports = loginRouter;