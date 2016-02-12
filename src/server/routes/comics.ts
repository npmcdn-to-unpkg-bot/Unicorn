import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';


router.get('/', function(request, response, next) {
    response.send('respond with a resource');
});

router.post('/', function(request, response, next) {
    Comic.query().insert({
        title: request.body.title
    }).then(function(comic:Comic){
        return ComicUser.query().insert({
            user_id: request.user.id,
            comic_id: comic.id
        });
    }).then(function(comicUser:ComicUser){
        response.redirect('/comics/'+comicUser.comic_id+'/edit');
    });
});

router.get('/new', function(request, response, next) {
    response.render('comics/new');
});

router.get('/:id/edit', function(request, response, next) {
    var comic = Comic.query().findById(request.params.id);
    response.render('comics/edit', {comic: comic});
});

export = router;
