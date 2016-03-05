import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';
import {ComicPanel} from '../models/ComicPanel';
import {SpeechBubble} from "../models/SpeechBubble";

// handling user background image uploads
var multer = require('multer');
var bcrypt = require('bcryptjs');


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
    // this is dulplicated in replace-background-image handler
    callback(null, req.body.comicPanelId+req.body.bginame+'.png');
  }
});

var upload = multer({ storage : storage}).single('uploadImage');

// Show all comics
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
                comic_id: comic.id,
                is_owner: true
            });
        }).then(function (comicUser:ComicUser) {
            response.redirect('/comics/' + comicUser.comic_id + '/edit');
        });
});

function notEmpty(value) {
    return value != "";
}

router.post('/searchcomic', function(request, response, next) {
    var searchKeyWords = [];
    searchKeyWords = request.body.comicname.split(" ").filter(notEmpty);

    Comic.query()
        .then(function (comics) {
            var notUsedComicList = comics;
            var newComicList = [];

            for (var j = 0; j < searchKeyWords.length; j ++) {
                var tempComicList = [];
                for (var i = 0; i < notUsedComicList.length; i++) {
                    if (notUsedComicList[i].title.indexOf(searchKeyWords[j]) > -1) {
                        newComicList.push(notUsedComicList[i]);
                    }
                    else {
                        tempComicList.push(notUsedComicList[i]);
                    }
                }
                notUsedComicList = tempComicList;
            }

            response.render('comics/index', {comics: newComicList});
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
    var comic:Comic;
    var owner:User;

    Comic.query()
        .findById(req.params.id)
        .eager('users')
        .then(function(returnedComic){
            comic = returnedComic;
            return comic.owner;
        })
        .then(function(comicOwner){
            owner = comicOwner;
            console.log(comicOwner);
            console.log(comic.users);
            res.render('comics/edit-collaborators', {
                comic: comic,
                collaborators: comic.users,
                owner: comicOwner
            });
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

router.post('/:comicPanelId/replace-background-image',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
		
		ComicPanel.query()
			.patch({background_image_url: '/images/'+req.params.comicPanelId+req.body.bginame + '.png'})
			.where('id','=',req.params.comicPanelId)
			.then(function (numUpdated) {
				console.log(numUpdated, "comic panels were updated (should be 1, since it is replacing a background image)");
			}).catch(function (err) {
			console.log(err.stack);
		    });
        res.end("File is uploaded");
    });
});

export = router;
