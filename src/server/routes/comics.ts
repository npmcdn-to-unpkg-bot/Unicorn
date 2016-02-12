import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';

router.get('/', function (req, res, next) {
    Comic.query()
        .then(function (comics) {
            res.render('comics/index', {comics: comics});
        });
});

router.post('/', function(request, response, next) {
    Comic.query()
        .insert({title: request.body.title})
        .then(function (comic:Comic) {
            return ComicUser.query().insert({
                user_id: request.user.id,
                comic_id: comic.id
            });
        }).then(function (comicUser:ComicUser) {
            response.redirect('/comics/' + comicUser.comic_id + '/edit');
        });
});

router.get('/new', function(request, response, next) {
    response.render('comics/new');
});

router.get('/:id', function(request, response, next) {
    Comic.query()
        .findById(request.params.id)
        .eager('users')
        .then(function (comic) {
            response.render('comics/show', {
                'comic': comic,
                'users': comic.users
            });
        });
});

router.get('/:id/edit', function(request, response, next) {
    Comic.query()
        .findById(request.params.id)
        .eager('comicPanels')
        .then(function(comic){
            response.render('comics/edit', {comic: comic});
        });
});


router.get('/:id/invite', function (req, res, next) {
    Comic.query()
        .findById(req.params.id)
        .eager('users')
        .then(function(comic){
        res.render('comics/invite-user', {comic: comic, collaborators: comic.users});
    });
});

export = router;
