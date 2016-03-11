import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';
import {ComicPanel} from '../models/ComicPanel';
import {SpeechBubble} from "../models/SpeechBubble";
import {SavedComic} from '../models/SavedComic';

// handling user background image uploads
var multer = require('multer');
var bcrypt = require('bcryptjs');


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
	var mt = file.mimetype;
	var slashPos = mt.indexOf("/");
	var extension = mt.substring(slashPos+1);
	if (mt.substring(0,slashPos)!="image") {
		throw new Error('Upload file not an image!');
	}
	var panelId = req.params.comicPanelId;
	ComicPanel.query().findById(panelId).then(function(panel:ComicPanel) {
		var title = req.body.panelTitle.substring(0,255) || panel.title || '';
		ComicPanel.query()
			.patch({background_image_url: '/images/' + panelId + '.' + extension, title: title})
			.where('id','=',panelId)
			.then(function (numUpdated) {
				console.log(numUpdated, "comic panels were updated (it should actually be 1, since it is replacing a background image)");
			}).catch(function (err) {
				console.log(err.stack);
			});
	});
    callback(null, req.body.comicPanelId + '.' + extension);
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
            var flash = request.flash();
			sortComicPanels(comic);
            response.render('comics/show', {
                'comic': comic,
                'users': comic.users,
                'isContributor': false,
                'flash' : flash
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
                    var flash = request.flash();
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
							sortComicPanels(comic);
                            response.render('comics/show', {
                                'user' : request.user,
                                'comic': comic,
                                'users': comic.users,
                                'isContributor': isContributor,
                                'isLoggedIn' : true,
                                'flash' : flash
                            });
                        });
                });
            });
    
    }
});

router.get('/:id/favourite', function(request, response, next) {
    User.query()
        .where('id', '=', request.user.id)
        .then(function(user) {
            console.log(user);

            return user[0].$relatedQuery('savedComics')
                .returning('*')
                .insert({
                    user_id: user[0].id,
                    comic_id: request.params.id
                })
        })
        .then(function(savedComic) {
            console.log(savedComic.user_id);
            console.log(savedComic.comic_id);
            request.flash('favouriteSuccess', 'Comic favourited to your account!');
            response.redirect('/comics/' + request.params.id);
        })    
        .catch(function(err) {
            console.log('Error');
            console.log(err);
            request.flash('alreadySaved', 'This comic has already been favourited.');
            response.redirect('/comics/' + request.params.id);
        });

})

router.get('/:id/edit', function(request, response, next) {
	// this is the query string
	var status = request.query.status;
    Comic.query()
        .findById(request.params.id)
        .eager('comicPanels.[speechBubbles]')
        .then(function(comic){
			sortComicPanels(comic);
            response.render('comics/edit', {comic: comic, status: status});
			console.log(comic.comicPanels);
        });
});

router.get('/:id/collaborators', function (req, res, next) {
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
            res.render('comics/edit-collaborators', {
                comic: comic,
                collaborators: comic.users,
                owner: comicOwner
            });
        });
});


/* POST to Add Contributor service */
router.post('/:id/collaborators', function (req, res) {


    User
        .query()
        .where('username', req.body.username)
        .then(function (user) {

            return ComicUser.query()
                .insert({
                    user_id: user[0].id,
                    comic_id: req.body.comicId
                })
        })

        .then(function () {
            Comic.query()
                .findById(req.body.comicId)
                .eager('users')
                .then(function(comic){
                    res.render('comics/edit-collaborators', {comic: comic, collaborators: comic.users, message: 'The user is now a contributor to this comic!', owner: comic.owner, status: 'Success'});
                });

        })
        .catch(function (err) {

            Comic.query()
                .findById(req.body.comicId)
                .eager('users')
                .then(function(comic){
                    res.render('comics/edit-collaborators', {comic: comic, collaborators: comic.users, message: 'Make sure the user exists and is not already a contributor to this comic.', owner: comic.owner, status: 'Fail'});
                    console.log(comic);
                });

        });


    /*
    User
        .query()
        .where('username', req.body.username)
        .first()
        .then(function (user) {
            return ComicUser.query()
                .insert({
                    user_id: user.id,
                    comic_id: req.body.comicId
                })
        })

        .then(function (comicUser:ComicUser) {
            console.log(comicUser.comic);
            return res.redirect(comicUser.comic.manageCollaboratorsUrl);
        })
        .catch(function (err) {
            console.log(err);
            res.redirect(comicUser.comic.manageCollaboratorsUrl)
        });
    */

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

router.post('/:comicPanelId/replace-background-image',function(req,res,next){
	var status_str = "BGStatusUnknown"
	var panelId = req.params.comicPanelId;
	// the following three 'step_x' functions are called asynchronously but in this exact order
	function step1UpdateBackground() {
		// Image upload with some simple checking. Please see definition of var storage = multer.diskStorage.
		// 		Here it's using domain module to catch all async errors thrown in multer processing
		var d = require('domain').create()
		d.on('error', function(err){
			// custom not-an-image error is thrown in multer processing
			console.log(err);
			status_str = "BGRemind";
			step3RespondToUser();
		})
		d.run(function() {
			// starts multer processing
			upload(req,res,function(err) {
				if(err) {
					// any non-custom error happened in multer processing
					console.log(err);
					status_str = "BGRetry";
				}
				// update title regardless
				status_str = "BGAllGood";
				step2UpdateTitle();
			});
		})
	}
	function step2UpdateTitle() {
		ComicPanel.query().findById(panelId).then(function(panel:ComicPanel) {
			// guard against the possibility of panelTitle and/or panel.title being empty/null
			var title = req.body.panelTitle || panel.title || '';
			title = title.substring(0,255);
			ComicPanel.query()
				.patch({title: title})
				.where('id','=',panelId)
				.then(function (numUpdated) {
					console.log(numUpdated, "comic panels were updated (it should actually be 1, since it is replacing a background image)");
					status_str = (status_str==="BGAllGood") ? "BGAllGood" : "BGRetry";
					step3RespondToUser();
				}).catch(function (err) {
					console.log(err.stack);
					status_str = (status_str==="BGAllGood") ? "BGRetry" : status_str;
					step3RespondToUser();
				});
		});
	}
	function step3RespondToUser() {
		ComicPanel
			.query()
			.findById(panelId)
			.then(function(panel:ComicPanel){
				status_str = encodeURIComponent(status_str);
				res.redirect('/comics/' + panel.comic_id + '/edit' + '/?status=' + status_str);
			})
	}
	step1UpdateBackground();
});

router.post('/:comicId/add-panel', function(req,res) {
	var comicId = req.params.comicId;
	var status_str = 'PanelStatusUnknown';
	Comic.query()
		.findById(comicId)
		.eager('comicPanels')
		.then(function(comic) {
			// panel position starts from 0
			comic
			.$relatedQuery('comicPanels')
			.insert({comic_id: comicId, position: comic.comicPanels.length, background_image_url: '/images/comic-panel-placeholder.png'})
			.then(function(test) {
				status_str = 'PanelAdded';
				respondToUser();
			}).catch(function(err){
				console.log(err);
				status_str = 'PanelRetry';
				respondToUser();
			});
		}).catch(function (err) {
			console.log(err.stack);
			status_str = 'PanelRetry';
			respondToUser();
		});
	
	function respondToUser() {
		res.redirect('/comics/' + comicId + '/edit' + '/?status=' + status_str);
	}
})

router.post('/:panelId/delete-panel', function(req,res) {
	var panelId = req.params.panelId;
	var status_str = 'PanelStatusUnknown';
	var comicId = req.body.comicId;		// hidden field in the submit form
	console.log(panelId);
	var comicId;
	// the following three functions are called asynchronously but in this exact order
	function step0() {
		// asynchronously delete all speech-bubbles on this panel
		ComicPanel.query().findById(panelId).then(function(panel){
			panel.$relatedQuery('speechBubbles').then(function(speechBubbles) {
				var promises = [];
				// created promises to delete each speech bubble
				speechBubbles.forEach(function(element){
					console.log(speechBubbles);
					var p = new Promise(function (resolve, reject) {
						SpeechBubble.query()
							.deleteById(element.id)
							.then(function(speechBubble:SpeechBubble) {
								console.log('Speech Bubble (id '+ element.id + ') deleted');
								resolve('Speech Bubble (id '+ element.id + ') deleted');
							}).catch(function(err){
								reject(err);
							});
					});
					promises.push(p);
				});
				Promise.all(promises).then(function(results) {
					console.log(results);
					step1();
				}, function(err) {
					console.log(err);
					respondToUser();
				});
			}).catch(function(err) {
				// catch panel query error
				console.log(err);
				respondToUser();
			});
		}).catch(function(err){
			// catch ComicPanel query error
			console.log(err);
			respondToUser();
		});
	}
	function step1() {
		// asynchronously delete a panel with NO speech-bubbles
		ComicPanel.query().deleteById(panelId).then(function(numDeleted){
			console.log("There are "+numDeleted+" panels deleted. Expected: 1");
			console.log('step1() ends');
			step2();
		}).catch(function(err){
			console.log(err);
			status_str = 'PanelNotDeleted'; 
			respondToUser();
		});		
	}
	function step2() {
		// asynchronously re-number the positions of panels
		Comic.query().findById(comicId).then(function(comic) {
			comic.$relatedQuery('comicPanels').orderBy('position').then(function(comicPanels) {
				console.log('step2() starts');
				var i;
				for (i=0; i<comicPanels.length; i++) {
					comicPanels[i].position = i;
				}
				// asynchronously update database
				var promises = [];
				comicPanels.forEach(function(panel){
					var p = new Promise(function(resolve,reject){
						ComicPanel.query().patch({position: panel.position}).where('id','=',panel.id)
							.then(function(numberOfAffectedRows){
								console.log("Panel id="+panel.id+" now has position "+panel.position+" NUM UPDATED = "+numberOfAffectedRows);
								resolve("Panel id="+panel.id+" now has position "+panel.position+" NUM UPDATED = "+numberOfAffectedRows);
							}).catch(function(err){
								console.log(err);
								reject({err:err});
							});
					});
					promises.push(p);
				});
				Promise.all(promises).then(function(results){
					console.log(results);
					status_str = 'PanelDeleted';
					respondToUser();
				}, function(reason){
					console.log(reason);
					// status_str = 'PanelFailedRenumber';
					status_str = 'PanelNotDeleted';
					respondToUser();
				});
				
			}).catch(function(err){
				console.log(err);
				respondToUser();
			});
		});
	}
	function respondToUser() {
		res.redirect('/comics/' + comicId + '/edit' + '/?status=' + status_str);
	}
	step0();
})

// helper functions
function sortComicPanels(comic) {
	comic.comicPanels = comic.comicPanels.sort(function (a,b) {return a.position - b.position});
}

function forLoopIndexClosure(arr,i) {
	return arr[i];
}

export = router;
