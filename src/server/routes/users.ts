<<<<<<< 4d5316ffac40359f0dc3df0fcc51b1df6d46e0b5
import * as express from 'express';
const router = express.Router();

var passport = require ('../middleware/passport');
import {User} from '../models/User';

var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users/index', {user : req.user});
});

/* GET Contributors page. */
router.get('/contributors', function(req, res) {

    User
        .query()
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
    res.render('users/signup', { title: 'Sign Up!' });
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
    res.render('users/login', { title: 'Login!' });
})

/* POST to Login User service. */
router.post('/login', passport.authenticate('local-login', {
        successRedirect:'/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })
);

/* Get profile page. */
router.get('/profile', function(req, res) {
    res.render('users/profile', {
        title: 'Welcome to ' + req.user.username + "'s profile page!",
        user: req.user
    })
});

/* GET log out. */
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

export = router;
=======
import * as express from 'express';
const router = express.Router();

var passport = require ('../middleware/passport');
import {User} from '../models/User';

var bcrypt = require('bcryptjs');

    
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users/index', {user : req.user});
});

/* GET Contributors page. */
router.get('/contributors', function(req, res) {
    User
        .query()
        .join('comic_user', 'users.id', '=', 'comic_user.user_id')
        // .groupBy('user_id')

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
    res.render('users/signup', {
        title: 'Sign Up!',
        message: req.flash('signupMessage')
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
    res.render('users/login', {
        title: 'Log in!',
        message: req.flash('loginMessage')
    });
});

/* POST to Login User service. */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureFlash: true
})
);

/* Get profile page. */
router.get('/profile', function(req, res) {
    console.log('flash message: ' + req.flash('failUsername'));
    console.log('flash message: ' + req.flash('updateSuccess'));
    res.render('users/profile', {
        user: req.user,
        updateFailure: req.flash('failUsername'),
        updateSuccess: req.flash('updateSuccess')
    });
});

/* GET log out. */
router.get('/logout', function(req, res) {8
    req.logout();
    res.redirect('/');
});

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
                console.log('Username already exists. Please choose another one.');
                req.flash('failUsername', 'Username already exists. Please choose another one.');
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
                req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('The email is already associated with another account.');
                req.flash('updateFailure', 'The email is already associated with another account.');
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
                req.flash('updateSuccess', 'User information updated.');
            })
            .catch(function(err) {
                console.log('Error');
                console.log(err);
            });
    }

    res.redirect('/users/profile');   
});

export = router;
>>>>>>> fixed passport error, flash messages for login/signup working, updating
