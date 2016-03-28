import * as express from 'express';
const router = express.Router();

var passport = require ('../middleware/passport');
import {User} from '../models/User';
import {Comic} from '../models/Comic';
import {ComicUser} from '../models/ComicUser';
import * as authorize from '../middleware/authorization';
import * as adminAuthorize from '../middleware/adminAuthorize';

var bcrypt = require('bcryptjs');


/* GET Contributors page. */
router.get('/contributors', function(req, res) {
    User.query()
        .join('comic_user', 'users.id', '=', 'comic_user.user_id')
        .distinct('user_id as id', 'username')

        .then(function(users) {
            console.log(users);
            res.render('users/userlist', { "users": users });
        })
        .catch(function(error) {
            console.log('Error!');
            console.log(error);
        });
        
});

/* GET all users page. */
router.get('/users', authorize, function(req, res) {
    User.query()
        .then(function(users) {
            console.log(users);
            res.render('users/userlist', { users: users, pageTitle: "Users" });
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

router.post('/:userId/delete', adminAuthorize, function(req,res,next){
    var comicsOwned = [];
    if (req.body.newOwner && req.body.comicId) {
        // new owner chosen
        ComicUser.query().patch({is_owner:false})
            .where('comic_id',req.body.comicId)
            .andWhere('user_id',req.params.userId)
            .then(function(numberOfAffectedRows){
                console.log("Removed",numberOfAffectedRows,"owner");
                ComicUser.query().patch({is_owner:true})
                    .where('comic_id',req.body.comicId)
                    .andWhere('user_id',req.body.newOwner)
                    .then(function(numberOfAffectedRows){
                        console.log("Added",numberOfAffectedRows,"owner");
                        respondToClient();
                    });
            });
    } else {
        respondToClient();
    }
    // query table comic_user for all comics owned by this user
    function respondToClient() {
        ComicUser.query()
            .select('comic_user.*','users.username')
            .join('users','comic_user.user_id','users.id')
            .then(function(cus){
                // cus stands for comic_user (plural)
                comicsOwned = cus.filter(function (elem){
                    return elem.user_id==req.params.userId && elem.is_owner;
                });
                if (comicsOwned.length == 0) {
                    // if this user doesn't own any comic, then just delete the user
                    deleteAndRespond(cus);
                } else {
                    // this user is a owner of at least one comic send back data for one comic to prompt admin
                    respondWithPrompt(cus);
                }
            }).catch(function(error) {
                console.log(error);
            });
    }
    
    function deleteAndRespond(cus) {
        User.query().deleteById(req.params.userId).then(function (numberOfDeletedRows) {
                    console.log('removed', numberOfDeletedRows, 'user');
                    res.send({statusString: "UserDeleted", comic:null, collaborators:null});
                }).catch(function(err){
                    console.log(err);
                    res.send({statusString: "UserNotDeleted", comic:null, collaborators:null});
                });
    }
    function respondWithPrompt(cus) {
        var comicTarget = {title: "", id: comicsOwned[0].comic_id};
        var collaborators = cus.filter(function(elem){
            return elem.comic_id==comicTarget.id && !elem.is_owner;
        });
        Comic.query()
            .findById(comicTarget.id).then(function(comic){
            comicTarget.title = comic.title;
            var collTarget = [];
            collaborators.forEach(function (elem, index, array) {
                collTarget.push({name:elem.username, id:elem.user_id});
            });
            res.send({statusString: "UserNotDeleted", comic:comicTarget, collaborators:collTarget});
        });
    }
});

export = router;

/*
router.post('/:userId/delete', adminAuthorize, function(req,res,next){
    if (req.body.comicId) {
        // new owner chosen
        res.send({statusString: "UserDeleted", comic:null, collaborators:null});
    } else {
        // query database for all comics owned by this user
        ComicUser.query()
            .where('user_id','=',req.params.userId)
            .eager('comics')
            .then(function(cus){
                if (cus.length == 0) {
                    // if this user doesn't own any comic, then just delete the user
                    User.query().deleteById(req.params.userId).then(function (numberOfDeletedRows) {
                        console.log('removed', numberOfDeletedRows, 'user');
                        res.send({statusString: "UserDeleted", comic:null, collaborators:null});
                    }).catch(function(err){
                        console.log(err);
                        res.send({statusString: "UserNotDeleted", comic:null, collaborators:null});
                    });
                } else {
                    // this user is a owner of at least one comic -- send back data to prompt admin
                    // stub
                    res.send({statusString: "UserNotDeleted", comic:null, collaborators:null});
                }
            });
    }
});
        User.query().deleteById(req.params.userId).then(function (numberOfDeletedRows) {
            console.log('removed', numberOfDeletedRows, 'user');
            res.send({statusString: "UserDeleted", comic:null, collaborators:null});
        }).catch(function(err){
            console.log(err);
            res.send({statusString: "UserNotDeleted", comic:null, collaborators:null});
        });
*/