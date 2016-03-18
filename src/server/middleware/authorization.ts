var passport = require('passport');
import * as express from 'express';

var authorization = function(request:express.Request, response:express.Response, next) {
    console.log('Time:', Date.now());

    console.log(request.user);
    if (request.user) {
        next();
    } else {
        response.redirect('/users/login');
    }
};

export = authorization;
