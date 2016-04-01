import * as express from 'express';
const router = express.Router();

import * as passport from 'passport';
import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {ComicUser} from '../models/ComicUser';
import {ComicPanel} from '../models/ComicPanel';
import {SpeechBubble} from "../models/SpeechBubble";
import {SavedComic} from '../models/SavedComic';
import * as authorize from '../middleware/authorization';
import * as adminAuthorize from '../middleware/adminAuthorize';

// handling user background image uploads
var multer = require('multer');
var sendmail = require('sendmail')();


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
        .eager('[users, comicPanels.[speechBubbles]]')
        .then(function (comics) {
            for (var i = 0; i++; i < length(comics)) {
                sortComicPanels(comics[i]);
            }
            res.render('comics/index', {comics: comics});
        });
});

/**
 * Create a new comic.
 */
router.post('/', authorize.loggedIn, function(request, response, next) {
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
    Comic.query().eager('[users,comicPanels]')
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
            response.app.render("comics/comics",{layout: false, comics: newComicList},function(err, html){
              var responseJson = {
                newComicsHtml: html
              };
              console.log(err);
              response.send(responseJson);
            });
            // response.render('comics/comics', {comics: newComicList});
        });
});

router.get('/new', authorize.loggedIn, function(request, response, next) {
    response.render('comics/new');
});

router.get('/:comicId', function(request, response, next) {
    // if statements doesn't seems to execute in query, have some duplicated code for now
    if (request.user == null) {
    
        Comic.query()
        .findById(request.params.comicId)
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
        
    } else {

        Comic.query()
            .findById(request.params.comicId)
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
                        .findById(request.params.comicId)
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

router.get('/:comicId/favourite', authorize.loggedIn, function(request, response, next) {
    User.query()
        .where('id', '=', request.user.id)
        .then(function(user) {
            console.log(user);

            return user[0].$relatedQuery('savedComics')
                .returning('*')
                .insert({
                    user_id: user[0].id,
                    comic_id: request.params.comicId
                })
        })
        .then(function(savedComic) {
            console.log(savedComic.user_id);
            console.log(savedComic.comic_id);
            request.flash('favouriteSuccess', 'Comic favourited to your account!');
            response.redirect('/comics/' + request.params.comicId);
        })    
        .catch(function(err) {
            console.log('Error');
            console.log(err);
            request.flash('alreadySaved', 'This comic has already been favourited.');
            response.redirect('/comics/' + request.params.comicId);
        });

});

router.get('/:comicId/unfavourite', authorize.loggedIn, function(request, response, next) {
    SavedComic.query()
        .where({
            'user_id': request.user.id,
            'comic_id': request.params.comicId
        })
        .del()
        .then(function(delCount) {
            console.log(delCount);
            if (delCount === 0) {
                request.flash('alreadyUnfavourited', 'Comic is already unfavourited.');
                response.redirect('/comics/' + request.params.comicId);
            } else {
                request.flash('unfavouriteSuccess', 'Comic has been unfavourited.');
                response.redirect('/comics/' + request.params.comicId);
            }
        })
        .catch(function(err) {
            console.log(err);
        })
});

// Request edit access to a comic
router.post('/:comicId/request-access', authorize.loggedIn, function(request, response, next){
    // get the owner of the comic
    var comic:Comic;
    var owner:User;

    Comic.query()
        .findById(request.params.comicId)
        .eager('users')
        .then(function(thisComic:Comic) {
            comic = thisComic;
            return comic.owner;
        })
        .then(function(thisOwner:User){
            owner = thisOwner;
            response.redirect(303, comic.url);

            sendmail({
                from: 'ubc-unicorn@peter.deltchev.com',
                to: owner.email,
                subject: '[Unicorn] A user has requested access to your comic!',
                content:
                    'Hi '+owner.username+'!\n\n'+
                    'The user "'+request.user.username+'" has requested access to your comic, '+
                    comic.title+'. To grant them access, follow the link below and enter their username!\n\n'+
                    'http://ubc-unicorn.deltchev.com'+comic.manageCollaboratorsUrl
            }, function(err, reply){
                console.log('=== Sendmail results:');
                console.log(err);
                console.log(reply);
            });
        });
});

router.get('/:comicId/edit', authorize.loggedIn, authorize.canEditComic, function(request, response, next) {
	// this is the query string
	var status = request.query.status;
    var thisComic:Comic;

    Comic.query()
        .findById(request.params.comicId)
        .eager('comicPanels.[speechBubbles]')
        .then(function(comic) {
            sortComicPanels(comic);
            thisComic = comic;
            return thisComic.owner;

        }).then(function(owner:User) {
            response.render('comics/edit', {comic: thisComic, owner: owner, status: status});
        });
});

router.get('/:comicId/collaborators', authorize.loggedIn, authorize.isComicOwner, function (req, res, next) {
    var comic:Comic;
    var owner:User;

    Comic.query()
        .findById(req.params.comicId)
        .eager('users')
        .then(function(returnedComic){
            comic = returnedComic;

            comic.users.map(function(user:User) {
                user.deleteCollaboratorUrl = '/comics/'+comic.id+'/collaborators/'+user.id;
                return user;
            });

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
router.post('/:comicId/collaborators', authorize.loggedIn, authorize.isComicOwner, function (req, res) {
    User
        .query()
        .where('username', req.body.username)
        .first()
        .then(function (user) {
            return ComicUser.query()
                .insert({
                    user_id: user.id,
                    comic_id: req.params.comicId
                })
        })

        .then(function(comicUser:ComicUser){
            return comicUser.$loadRelated('comics');
        })

        .then(function (comicUser:ComicUser) {
            console.log(comicUser.comics);
            return res.redirect(comicUser.comics.manageCollaboratorsUrl);
        })
        .catch(function (err) {
            console.log(err);
        });

});

/* DELETE a contributor from a comic */
router.delete('/:comicId/collaborators/:userId', authorize.loggedIn, authorize.isComicOwner, function (req, res) {
    ComicUser.
        query()
        .where('comic_id', req.params.comicId)
        .where('user_id', req.params.userId)
        .delete()
        .then(function(){
            return res.redirect(303, '/comics/'+req.params.comicId+'/collaborators');
        })
});



router.post('/:comicId/panels/:panelId/speech-bubbles', authorize.loggedIn, authorize.canEditComic, function(request, response, next) {
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
            Comic
              .query()
              .findById(request.params.comicId)
              .then(function(targetComic:Comic){
                User
                  .query()
                  .whereIn(
                      'id',
                      ComicUser.query()
                          .select('user_id')
                          .where('comic_id', targetComic.id)
                          .where('is_owner', true)
                  )
                  .first()
                  .then(function(owner:User){
                      var req = request;
                      console.log('Hi '+owner.username+'!\n\n'+
                              'The user "'+req.user.username+'" has edited speech bubbles of your comic, '+
                              targetComic.title+'. Follow the link below to check it out!\n\n'+
                              'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id);
                      sendmail({
                          from: 'ubc-unicorn@peter.deltchev.com',
                          to: owner.email,
                          subject: '[Unicorn] A user has edited your comic!',
                          content:
                              'Hi '+owner.username+'!\n\n'+
                              'The user "'+req.user.username+'" has edited speech bubbles of your comic, '+
                              targetComic.title+'. Follow the link below to check it out!\n\n'+
                              'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id
                      }, function(err, reply){
                          console.log('=== Sendmail results:');
                          console.log(err);
                          console.log(reply);
                      });
                  });
              });
        });
});


router.put('/speech-bubbles/:id', authorize.loggedIn, function(request, response, next) {
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
            var targetComic = speechBubble.comicPanel.comic;
            User
              .query()
              .whereIn(
                  'id',
                  ComicUser.query()
                      .select('user_id')
                      .where('comic_id', targetComic.id)
                      .where('is_owner', true)
              )
              .first()
              .then(function(owner:User){
                  var req = request;
                  console.log('Hi '+owner.username+'!\n\n'+
                          'The user "'+req.user.username+'" has edited speech bubbles of your comic, '+
                          targetComic.title+'. Follow the link below to check it out!\n\n'+
                          'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id);
                  sendmail({
                      from: 'ubc-unicorn@peter.deltchev.com',
                      to: owner.email,
                      subject: '[Unicorn] A user has edited your comic!',
                      content:
                          'Hi '+owner.username+'!\n\n'+
                          'The user "'+req.user.username+'" has edited speech bubbles of your comic, '+
                          targetComic.title+'. Follow the link below to check it out!\n\n'+
                          'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id
                  }, function(err, reply){
                      console.log('=== Sendmail results:');
                      console.log(err);
                      console.log(reply);
                  });
              });
        });
});

router.delete('/speech-bubbles/:id', authorize.loggedIn, function(request, response, next) {
    SpeechBubble.query()
        .deleteById(request.params.id)
        .then(function(speechBubble:SpeechBubble) {
            response.send({success: true});
        });
});

router.post('/:comicPanelId/replace-background-image', authorize.loggedIn, function(req,res,next){
	var status_str = "BGStatusUnknown";
	var panelId = req.params.comicPanelId;
	var targetComicId, targetPanel;
	// the following three 'step_x' functions are called asynchronously but usually in this exact order
	function step1UpdateTitle() {
		ComicPanel.query().findById(panelId).eager('speechBubbles').then(function(panel:ComicPanel) {
			targetPanel = panel;
			targetComicId = panel.comic_id;
			// guard against the possibility of panelTitle and/or panel.title being empty/null
			var title = req.body.panelTitle || panel.title || '';
			title = title.substring(0,255);
			ComicPanel.query()
				.patch({title: title})
				.where('id','=',panelId)
				.then(function (numUpdated) {
					status_str = (status_str==="BGAllGood") ? "BGAllGood" : "BGRetry";
					step2UpdateBackground();
				}).catch(function (err) {
					console.log(err.stack);
					status_str = (status_str==="BGAllGood") ? "BGRetry" : status_str;
					step2UpdateBackground();
				});
		});
	}
	function step2UpdateBackground() {
		// Image upload with some simple checking. Please see definition of var storage = multer.diskStorage.
		// 		Here it's using domain module to catch all async errors thrown in multer processing
		var d = require('domain').create();
		d.on('error', function(err){
			// custom not-an-image error is thrown in multer processing
			console.log(err);
			status_str = "BGRemind";
			step3RespondToUser();
		});
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
				step3RespondToUser();
			});
		})
	}
	function step3RespondToUser() {
    res.redirect('/comics/' + targetComicId + '/edit' + '/?status=' + status_str);
    /* This is a failed try, kept for future reference (cannot handle file upload from a PUT request)
		Comic.query()
        .findById(targetComicId)
        .eager('comicPanels.[speechBubbles]')
        .then(function(targetComic){
          sortComicPanels(targetComic);
                //response.render('comics/edit', {comic: comic, panel: targetPanel, status: status_str});
          res.app.render("comics/panel",{layout: false, comic: targetComic, panel: targetPanel, index: targetPanel.position},function(err, html){
            var response = {
              newPanelHtml: html,
              statusString: status_str
            };
              console.log(err);
              res.send(response);
          });
        });
    */
	}
	step1UpdateTitle();
});

router.post('/:comicId/add-panel', authorize.loggedIn, authorize.canEditComic, function(req,res) {
	var comicId = req.params.comicId;
	var status_str = 'PanelStatusUnknown';
  var targetComic, newPanel, newIndex, numPanels;
	Comic.query()
		.findById(comicId)
		.eager('comicPanels')
		.then(function(comic) {
			// panel position starts from 0
			targetComic = comic;
			newIndex = comic.comicPanels.length;
			comic
			.$relatedQuery('comicPanels')
			.insert({comic_id: comicId, position: newIndex, background_image_url: '/images/comic-panel-placeholder.png'})
			.eager('speechBubbles')
			.then(function(panel) {
				newPanel = panel;
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
		res.app.render("comics/panel",{layout: false, comic: targetComic, panel: newPanel, index: newIndex},function(err, html){
			var response = {
				newPanelHtml: html,
				statusString: status_str
			};
			console.log(err);
			res.send(response);
      User
      .query()
      .whereIn(
          'id',
          ComicUser.query()
              .select('user_id')
              .where('comic_id', targetComic.id)
              .where('is_owner', true)
      )
      .first()
      .then(function(owner:User){
          console.log('Hi '+owner.username+'!\n\n'+
                  'The user "'+req.user.username+'" has edited (added panels to) your comic, '+
                  targetComic.title+'. Follow the link below to check it out!\n\n'+
                  'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id);
          sendmail({
              from: 'ubc-unicorn@peter.deltchev.com',
              to: owner.email,
              subject: '[Unicorn] A user has edited your comic!',
              content:
                  'Hi '+owner.username+'!\n\n'+
                  'The user "'+req.user.username+'" has edited (added panels to) your comic, '+
                  targetComic.title+'. Follow the link below to check it out!\n\n'+
                  'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id
          }, function(err, reply){
              console.log('=== Sendmail results:');
              console.log(err);
              console.log(reply);
          });
      });
		});
	}
});

router.post('/:panelId/delete-panel', authorize.loggedIn, function(req,res) {
	var panelId = req.params.panelId;
	var status_str = 'PanelStatusUnknown';
	var comicId = req.body.comicId;		// hidden field in the submit form
	var panels, numPanels;
	// the following three functions are called asynchronously but in this exact order
	function step0() {
		// asynchronously delete all speech-bubbles on this panel
		ComicPanel.query().findById(panelId).then(function(panel){
			panel.$relatedQuery('speechBubbles').then(function(speechBubbles) {
				var promises = [];
				// created promises to delete each speech bubble
				speechBubbles.forEach(function(element){
					var p = new Promise(function (resolve, reject) {
						SpeechBubble.query()
							.deleteById(element.id)
							.then(function(speechBubble:SpeechBubble) {
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
        panels = comicPanels;
        numPanels = comicPanels.length;
				var i;
				for (i=0; i<numPanels; i++) {
          loopSetPositionHelper(comicPanels[i],i);
				}
				// asynchronously update database
        // This is a bit of a hack, inserting fake data first before renumbering in order to circumvent UNIQUE contraint
				var promises = [];
				comicPanels.forEach(function(panel){
          promises.push(promiseGenerator(panel,numPanels+1)); // plus 1 again to avoid position conflict with the last panel before re-numbering
        });
        function promiseGenerator(panel,offset){
          var pos = offset+panel.position;
					var p = new Promise(function(resolve,reject){
						ComicPanel.query().patch({position: pos}).where('id','=',panel.id)
							.then(function(numberOfAffectedRows){
								resolve("Panel id="+panel.id+" now has position "+pos+" NUM UPDATED = "+numberOfAffectedRows);
							}).catch(function(err){
								console.log(err);
								reject({err:err});
							});
					});
					return p;
				}
        console.log("Begin numbering");
				Promise.all(promises).then(function(results){
					console.log(results);
          // Now update with real data
          var promises1 = [];
          panels.forEach(function(panel){
            promises1.push(promiseGenerator(panel,0));
          });
          Promise.all(promises1).then(function(results){
            console.log(results);
            status_str = 'PanelDeleted';
            respondToUser();
          }, function(reason){
            console.log(reason);
            status_str = 'PanelNotDeleted';
            respondToUser();
          });
            
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
  
  function loopSetPositionHelper(p, i) {
    p.position = i;
  }
	step0();
});

router.put('/:comicId/save-panels-order', authorize.loggedIn, authorize.canEditComic, function(req, res, next) {
  var status_str = "PanelReorderUnknown";
  var comicId = req.params.comicId;
  var newOrder = req.body["newOrder[]"];   // an array of old positions
  var numPanels;
  var targetComic;
  
  Comic.query().findById(comicId).eager('comicPanels').then(function(comic){
    targetComic = comic;
    // asynchronously update database
    // This is a bit of a hack, inserting fake data first before renumbering in order to circumvent UNIQUE contraint
    numPanels = comic.comicPanels.length;
    var promises = [];
    comic.comicPanels.forEach(function(panel){
      promises.push(promiseGenerator(panel,numPanels));
    });
    function promiseGenerator(panel, offset){
      var pos = offset + newOrder.indexOf(String(panel.position));
      var p = new Promise(function(resolve,reject){
        ComicPanel.query().patch({position: pos}).where('id','=',panel.id)
          .then(function(numberOfAffectedRows){
            resolve("Panel id="+panel.id+" now has position "+pos+" NUM UPDATED = "+numberOfAffectedRows);
          }).catch(function(err){
            console.log(err);
            reject({err:err});
          });
      });
      return p;
    }
    Promise.all(promises).then(function(results){
      var promises1 = [];
      targetComic.comicPanels.forEach(function(panel){
        promises1.push(promiseGenerator(panel,0));
      });
      Promise.all(promises1).then(function(results){
        status_str = 'PanelReordered';
        respondToUser();
      },function(reason){
        console.log(reason);
        status_str = 'PanelNotReordered1';
        respondToUser();
      });
    }, function(reason){
      console.log(reason);
      status_str = 'PanelNotReordered2';
      respondToUser();
    });
  }).catch(function(err){
    console.log(err);
    status_str="really unkown!";
    respondToUser();
  });
  
  function respondToUser() {
    var response = {
      statusString: status_str
    };
    User
      .query()
      .whereIn(
          'id',
          ComicUser.query()
              .select('user_id')
              .where('comic_id', targetComic.id)
              .where('is_owner', true)
      )
      .first()
      .then(function(owner:User){
          console.log('Hi '+owner.username+'!\n\n'+
                  'The user "'+req.user.username+'" has edited (reordered panels of) your comic, '+
                  targetComic.title+'. Follow the link below to check it out!\n\n'+
                  'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id);
          sendmail({
              from: 'ubc-unicorn@peter.deltchev.com',
              to: owner.email,
              subject: '[Unicorn] A user has edited your comic!',
              content:
                  'Hi '+owner.username+'!\n\n'+
                  'The user "'+req.user.username+'" has edited (reordered panels of) your comic, '+
                  targetComic.title+'. Follow the link below to check it out!\n\n'+
                  'http://ubc-unicorn.deltchev.com/comics/'+targetComic.id
          }, function(err, reply){
              console.log('=== Sendmail results:');
              console.log(err);
              console.log(reply);
          });
          res.send(response);
      });
  }
});

router.delete('/:comicId',adminAuthorize, function(req, res, next){
  Comic.query().deleteById(req.params.comicId).then(function(numberOfDeletedRows){
    console.log('removed', numberOfDeletedRows, 'comic');
    res.send({statusString: "ComicDeleted"});
  }).catch(function (err) {
    console.log(err);
    res.send({statusString: "ComicNotDeleted"});
  });
});

// helper functions
function sortComicPanels(comic) {
	comic.comicPanels = comic.comicPanels.sort(function (a,b) {return a.position - b.position});
}

function forLoopIndexClosure(arr,i) {
	return arr[i];
}

export = router;
