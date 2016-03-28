var passport = require('passport');
import * as express from 'express';

var adminAuthorization = function(request:express.Request, response:express.Response, next) {
    console.log('Time:', Date.now());

    console.log(request.user);
    if (request.user && request.user.username=="admin") {
        next();
    } else {
        response.status(403);
        response.send({statusString: "UserNotDeleted", comic:null, collaborators:null});
    }
};

export = adminAuthorization;
