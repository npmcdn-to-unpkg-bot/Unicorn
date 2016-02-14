var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('../models/User').User;
var bcrypt = require('bcrypt');

    passport.serializeUser(function(user, done) {
            console.log(user[0]);
        console.log(user.id);
        //done(null, user.id);    // only user id stored in session
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.query()
            .where('id', '=', id)
            .then(function(users) {
                done(null, users[0]);
            })
            .catch(function(error) {
                done(error, null);
            });
    });


    // // https://scotch.io/tutorials/easy-node-authentication-setup-and-local
    // http://passportjs.org/docs/username-password
    passport.use('local-signup', new LocalStrategy({
         usernameField: 'username',
         passwordField: 'userpassword',
         passReqToCallback: true
     },
        function(req,username, password, done) {
            console.log("AUTHENTICATING...");
            process.nextTick(function() {
            var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
            User.query()
                .insert({
                    'username': username,
                    'password': hash
                })
                .then(function(user) {
                    console.log('User added');
                    done(null, user);
                })
                .catch(function(err) {
                    console.log('Username exists already');
                    done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                });
             })
        }));

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'userpassword',
        passReqToCallback: true
    },
        function(req, username, password, done) {
            User.query()
                .where('username', username)
                .then(function(user) {
                     // user is found
                     if (user.password == password) {
                         //successful user
                         console.log('successful user');
                         done(null, user);
                     } else {
                         console.log('USER EXISTS, WRONG PASSWORD');
                         done(null, false, req.flash('loginMessage', 'Wrong password.'));
                     }
                })
                .catch(function(err) {
                    // no user found
                    console.log('NO USER FOUND m8');
                    done(null, false, req.flash('loginMessage', 'No user found.'));
                })

        }
    ))
    //            res.redirect('/users/' + req.user.username);
    //        })
    //        .catch(function(error) {
    //            res.send("Invalid username and password combination.")
    // });
    
    export = passport;