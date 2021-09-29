const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//////////////json web token
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config');

const Users = require('./schemas/users');

exports.local = passport.use(new LocalStrategy(Users.authenticate()));

// The below codes are used for support of sessions
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn : 3600});
}

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log('JWT Payload : ', jwt_payload);
    Users.findOne({_id : jwt_payload._id}, (err, user) => {
        if(err){
            return done(err, false);
        }
        else if(user){
            return done(null, user);
        }
        else return done(null, false);
    })
}))

exports.verifyUser = passport.authenticate('jwt', {session: false});