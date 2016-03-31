var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var User = require('../models/User').User;
var bcrypt = require('bcrypt');

    passport.serializeUser(function(user, done) {
        done(null, user.id);        // user id stored in session
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

            process.nextTick(function() {
                User.query()
                    .insert({
                        'username': username,
                        'email': req.body.useremail,
                        'password': hash, 
                        'profile_picture_url': '/images/default-profile-picture.png'
                    })
                    .then(function(user) {
                        console.log('User added');
                        console.log(user);
                        done(null, user);
                    })
                    .catch(function(err) {
                        console.log(err);
                        done(null, false, req.flash('signupMessage', 'That username is already taken. Please choose another one.'));
                    });
            });
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
                            done(null, user[0]);
                        } else {
                            console.log('wrong password');
                            done(null, false, req.flash('loginMessage', 'Wrong username and password combination.' ));
                        }
                    
                })
                .catch(function(err) {
                    // username doesnt exist
                    console.log('no user found');
                    done(null, false, req.flash('loginMessage', 'Wrong username and password combination.'));
                });
        }
    ));
    //            res.redirect('/users/' + req.user.username);
    //        })
    //        .catch(function(error) {
    //            res.send("Invalid username and password combination.")
    // });
    
    export = passport;