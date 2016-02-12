var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var User = require('../models/User').User;

passport.serializeUser(function (user, done) {
    console.log(user[0]);
    console.log(user.id);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.query()
        .where('id', '=', id)
        .then(function(users){
            done(null, users[0]);
        })
        .catch(function(error){
            done(error, null);
        });
});

passport.use(new Strategy(
    function (username, password, done) {
        User.query()
            .where('username', '=', username)
            .then(function (users){
                // TODO: implement actual authentication here!
                return done(null, users[0]);
            })
            .catch(function (error){
                return done(error);
            });
    }
));
