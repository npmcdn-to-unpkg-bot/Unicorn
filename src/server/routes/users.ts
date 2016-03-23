import * as express from 'express';
const router = express.Router();

var passport = require ('../middleware/passport');
import {User} from '../models/User';
import {Comic} from '../models/Comic';

var bcrypt = require('bcryptjs');


/* GET Contributors page. */
router.get('/contributors', function(req, res) {
    User.query()
        .join('comic_user', 'users.id', '=', 'comic_user.user_id')
        .distinct('user_id', 'username')

        .then(function(users) {
            console.log(users);
            res.render('users/userlist', { "users": users });
        })
        .catch(function(error) {
            console.log('Error!');
            console.log(error);
        });
        
});

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
    var flash = req.flash();
    res.render('users/signup', {
        title: 'Sign Up!',
        flash : flash
    });
});

/* POST sign up page. */
router.post('/adduser',
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/users/signup',
        failureFlash: true        // allow flash messages
    })
);

/* GET login page. */
router.get('/login', function(req, res) {
    var flash = req.flash();
    res.render('users/login', {
        title: 'Log in!',
        flash: flash
    });
});

/* POST to Login User service. */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}) 
);

/* Get profile page. */
router.get('/profile', function(req, res) {
    User.query()
        .where('id', '=', req.user.id)
        .then(function(user) {
            return user[0].$relatedQuery('comicsFromSavedComics')
                .where('user_id', '=', req.user.id)
                .select('*')
        })
        .then(function(savedComics) {
            console.log(savedComics);
            if (!savedComics[0]) {
                res.render('users/profile', {
                    savedComics: [],
                    user: req.user
                })
            } else {
                res.render('users/profile', {
                    savedComics: savedComics,
                    user: req.user
                });
            }
        })
        .catch(function(err) {
            console.log('Error');
            console.log(err);
            res.render('users/profile', { user: req.user });
        });
});

/* GET log out. */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

function notEmpty(value) {
    return value != "";
}

router.post('/searchContributor', function(request, response, next) {
    var searchKeyWords = [];
    searchKeyWords = request.body.contributorname.split(" ").filter(notEmpty);

    User.query()
        .join('comic_user', 'users.id', '=', 'comic_user.user_id')
        .distinct('user_id', 'username')

        .then(function(users) {

            var notUsedUserList = users;
            var newUserList = [];

            for (var j = 0; j < searchKeyWords.length; j ++) {
                var tempUserList = [];
                for (var i = 0; i < notUsedUserList.length; i++) {
                    if (notUsedUserList[i].username.indexOf(searchKeyWords[j]) > -1) {
                        newUserList.push(notUsedUserList[i]);
                    }
                    else {
                        tempUserList.push(notUsedUserList[i]);
                    }
                }
                notUsedUserList = tempUserList;
            }

            response.app.render("users/userlist_bottom_panel",{layout: false, users: newUserList},function(err, html){
                var responseJson = {
                    newUsersHtml: html
                };
                console.log(err);
                response.send(responseJson);
            });

            //res.render('users/userlist', { "users": newUserList });
        })
        .catch(function(error) {
            console.log('Error!');
            console.log(error);
        });

});

/* GET update user. */
router.get('/update', function(req, res) {
    var flash = req.flash();

    res.render('users/updateprofile', {
        user: req.user,
        flash: flash
    });
})

/* POST update user. */
router.post('/update', function(req, res) {
    var hash = bcrypt.hashSync(req.body.userpassword, bcrypt.genSaltSync(8), null);

    if (req.body.username) {
        User.query()
            .update({
                username: req.body.username
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Username updated');
                return req.flash('updateSuccess', 'User information updated.');
             })
            .catch(function(err) {
                console.log('Username already exists');
                console.log(err);
                req.flash('usernameFail', 'Username already exists. Please choose another one.');
                res.redirect('/users/profile');
            });
    }

    if (req.body.useremail) {
        User.query()
            .update({
                email: req.body.useremail
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Email updated');
                return req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('The email is already associated with another account.');
                req.flash('emailFail', 'The email is already associated with another account.');
                res.redirect('/users/profile');
            });
    }

    if (req.body.userpassword) {
        User.query()
            .update({
                password: hash
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Password updated to:' + req.body.userpassword);
                return req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('Error');
                console.log(err);
                req.flash('passwordFail', 'Please choose a different password.');
                res.redirect('/users/profile');
            });
    }

    if (req.body.location) {
        User.query()
            .update({
                location: req.body.location
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Location updated to:' + req.body.location);
                return req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('Error');
                console.log(err);
                req.flash('locationFail', 'Location error.');
                res.redirect('/users/profile');
            });
    }

    if (req.body.gender) {
        User.query()
            .update({
                gender: req.body.gender
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Gender updated to:' + req.body.gender);
                return req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('Error');
                console.log(err);
                req.flash('genderFail', 'Please choose one.');
                res.redirect('/users/profile');
            });
    }

    if (req.body.fullname) {
        User.query()
            .update({
                fullname: req.body.fullname
            })
            .where('id', req.user.id)
            .then(function(count) {
                console.log('Fullname updated to:' + req.body.fullname);
                return req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('Error');
                console.log(err);
                req.flash('fullnameFail', 'Please enter your name.');
                res.redirect('/users/profile');
            });
    }
    res.redirect('/users/profile');

});

export = router;
