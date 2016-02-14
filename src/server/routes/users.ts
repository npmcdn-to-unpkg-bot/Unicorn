import * as express from 'express';
const router = express.Router();

var passport = require ('../middleware/passport');
import {User} from '../models/User';

var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('users/index', {user : req.user});
});


/* GET sign up page. */
router.get('/signup', function(req, res, next) {
    res.render('users/signup', { title: 'Sign Up!' });
});

/* Get sign up page. */
router.post('/adduser',
    passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/users/signup',
        failureFlash: true        // allow flash messages
    })
);

/* GET login page. */
router.get('/login', function(req, res) {
    res.render('users/login', { title: 'Login!' });
})

// ***BROKEN ATM***
// /* GET Login page. */
// router.get('/login', function(req, res, next) {
//     https://truongtx.me/2014/03/29/authentication-in-nodejs-and-expressjs-with-passportjs-part-1/
//     if (req.user) {
//         // already logged in
//         res.send("You are already logged in!");
//         res.redirect('/');
//     } else {
//         // not logged in
//         res.render('users/login', { title: 'Log In!' });
//     }
// });


/* POST to Login User service. */
router.post('/loginUser', passport.authenticate('local-login', {
        successRedirect:'/profile',
        failureRedirect: '/user/login',
        failureFlash: true

}));

/* Get profile page. */
router.get('/profile', function(req, res) {
    res.render('users/profile', {
        user: req.user
    })
});

/* GET log out. */
router.get('/logout', function(req, res) {
    var name = req.user.username;
    console.log("LOGGING OUT " + req.user.username)
    req.logout();
    res.redirect('/');
});

export = router;
