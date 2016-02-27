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
