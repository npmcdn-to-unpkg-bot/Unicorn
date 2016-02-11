import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {User} from '../models/User';

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
    res.render('login')
});

router.post('/login', function(req, res, next) {
    // TODO: do real authentication here
    User.query()
        .where('username', '=', req.body.username)
        .then(function(users:User[]){
            var user = users[0];

            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/users/' + req.user.username);
            });
        });
});

export = router;
