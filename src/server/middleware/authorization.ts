import {Comic} from "../models/Comic";
import {User} from "../models/User";
import * as express from 'express';

var authorization = {
    loggedIn: function(request:express.Request, response:express.Response, next) {
        if (request.user) {
            next();
        } else {
            response.redirect('/users/login');
        }
    },

    /**
     * This middleware assumes that a :comicId parameter is present in the URL.
     * @param request
     * @param response
     * @param next
     */
    canEditComic: function(request:express.Request, response:express.Response, next) {
        Comic.query().findById(request.params.comicId)
            .then(function(comic:Comic){
                return request.user.canEditComic(comic);
            })
            .then(function(canEdit:boolean){
                if (canEdit) {
                    next();
                } else {
                    response.sendStatus(403);
                }
            });
    },

    /**
     * This middleware assumes that a :comicId parameter is present in the URL.
     */
    isComicOwner: function (request:express.Request, response:express.Response, next) {
        Comic.query().findById(request.params.comicId)
            .then(function(comic:Comic){
                return comic.owner;
            })
            .then(function (owner:User) {
                if (request.user.id === owner.id) {
                    next();
                } else {
                    response.sendStatus(403);
                }
            });
    }
};

export = authorization;
