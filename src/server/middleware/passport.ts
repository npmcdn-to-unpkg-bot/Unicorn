var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('../models/User').User;
var bcrypt = require('bcrypt');

    passport.serializeUser(function(user, done) {
            console.log(user[0]);
        console.log(user[0].id);
        //done(null, user.id);    // only user id stored in session
        done(null, user[0].id);
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
            var hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
            console.log("AUTHENTICATING...");
            process.nextTick(function() {
            User.query()
                .insert({
                    'username': username,
                    'password': hash
                })
                .then(function(user) {
                    console.log('User added');
                    console.log(user);
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
            User.query().where('username', '=', username).select('*')
                .then(function(user) {
                    console.log(user);
                    console.log('input pwd: ' + password);
                    console.log('user pwd: ' + user[0].password);   

                    var passwordDB = user[0].password;         
                        // username exists
                        if (bcrypt.compareSync(password, passwordDB)) {
                            console.log('logging in...');
                            done(null, user);
                        } else {
                            console.log('wrong password');
                            done(null, false);
                        }
                    
                })
                .catch(function(err) {
                    // username doesnt exist
                    console.log('no user found');
                    done(null, false, req.flash('loginMessage', 'Wrong password.'));
                });
        }
    ));
    //            res.redirect('/users/' + req.user.username);
    //        })
    //        .catch(function(error) {
    //            res.send("Invalid username and password combination.")
    // });
    
    export = passport;