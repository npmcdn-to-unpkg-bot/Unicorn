var passport = require('passport');
import {Strategy} from 'passport-local';
import {User} from '../models/User';

passport.serializeUser(function (user:User, done) {
    console.log(user[0]);
    console.log(user.id);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.query()
        .where('id', '=', id)
        .then(function(users:User[]){
            done(null, users[0]);
        })
        .catch(function(error){
            done(error, null);
        });
});

passport.use(new Strategy(
    function (username:string, password:string, done) {
        User.query()
            .where('username', '=', username)
            .then(function (users:User[]){
                // TODO: implement actual authentication here!
                return done(null, users[0]);
            })
            .catch(function (error){
                return done(error);
            });
    }
));
