import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';
import {ComicPanel} from '../models/ComicPanel';
import {SpeechBubble} from "../models/SpeechBubble";

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
    
	// if statements doesn't seems to execute in query, have some duplicated code for now
	if (request.user == null) {
	
		Comic.query()
        .findById(request.params.id)
        .eager('[users, comicPanels.[speechBubbles]]')
        .then(function (comic) {
			response.render('comics/show', {
				'comic': comic,
				'users': comic.users,
				'isContributor': false
			});
        });
		
	}
	else {
	
		Comic.query()
			.findById(request.params.id)
			.eager('[users, comicPanels.[speechBubbles]]')
			.then(function (comic) {
				comic
				.$relatedQuery('users')
				.where('comic_user.user_id', request.user.id)
				.then(function (user) {
					var isContributor = false;
					if (user.length != 0) {
						isContributor = true;
					}
					else {
						isContributor = false;
					}
					
					// 'comic' after relatedQuery seems to change the comic, requery for now 
					Comic.query()
						.findById(request.params.id)
						.eager('[users, comicPanels.[speechBubbles]]')
						.then(function (comic) {
							response.render('comics/show', {
								'comic': comic,
								'users': comic.users,
								'isContributor': isContributor
							});
						});
				});
			});
	
	}
});

router.get('/:id/edit', function(request, response, next) {
    Comic.query()
        .findById(request.params.id)
        .eager('comicPanels.[speechBubbles]')
        .then(function(comic){
            response.render('comics/edit', {comic: comic});
        });
});


router.get('/:id/invite', function (req, res, next) {
    Comic.query()
        .findById(req.params.id)
        .eager('users')
        .then(function(comic){
        res.render('comics/edit-collaborators', {comic: comic, collaborators: comic.users});
    });
});


router.post('/:comicId/panels/:panelId/speech-bubbles', function(request, response, next) {
    ComicPanel.query()
        .findById(request.params.panelId)
        .then(function(comicPanel:ComicPanel){
            return comicPanel.$relatedQuery('speechBubbles')
                .insert({
                    text: 'Twilight Sparkle is best pony!',
                    position_x: 0,
                    position_y: 0,
                })
        })
        .then(function(speechBubble:SpeechBubble) {
            response.redirect('/comics/' + request.params.comicId + '/edit');
        });
});


router.put('/speech-bubbles/:id', function(request, response, next) {
    SpeechBubble.query()
        .findById(request.params.id)
        .then(function(speechBubble:SpeechBubble) {
            return speechBubble.$query().patch({
                text: request.body.text,
                position_x: parseInt(request.body.position_x),
                position_y: parseInt(request.body.position_y),
            })
        })
        .then(function(numUpdated:number) {
            return SpeechBubble.query()
                .findById(request.params.id)
                .eager('comicPanel.comic');
        })
        .then(function(speechBubble:SpeechBubble) {
            response.send({success: true});
        });
});

router.delete('/speech-bubbles/:id', function(request, response, next) {
    SpeechBubble.query()
        .deleteById(request.params.id)
        .then(function(speechBubble:SpeechBubble) {
            response.send({success: true});
        });
});

export = router;
