import * as express from 'express';
const router = express.Router();

import {Comic} from '../models/Comic';
import {User} from '../models/User';
import {BaseModel} from '../models/BaseModel';
import {ComicUser} from '../models/ComicUser';

var uuid = require('node-uuid');
var multer = require('multer');
var bcrypt = require('bcryptjs');


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage : storage}).single('uploadImage');

router.post('/saveImage',function(req,res){
    upload(req,res,function(err) {
        if(err) {
			console.log(err);
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Unicorn Comics!' });
});



/* POST to Add Contributor service */
router.post('/addContributorToComic', function(req, res) {
	
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
                res.render('comics/edit-collaborators', {comic: comic, collaborators: comic.users, message: 'The user is now a contributor to this comic!', messageColour: '#00FF1A'});
            });

    })
	.catch(function (err) {

        Comic.query()
            .findById(req.body.comicId)
            .eager('users')
            .then(function(comic){
                res.render('comics/edit-collaborators', {comic: comic, collaborators: comic.users, message: 'Make sure the user exists and is not already a contributor to this comic.', messageColour: '#FF0000'});
            });

	});
	
});


/* GET upload a comic. */
router.get('/upload', function(req, res, next) {	
	Comic.query()
	.then(function(comics) {
		res.render('upload', { title:'upload'});
	});
});


/* Functions for development use */

router.get('/insertTestComic', function(req, res, next) {
	Comic.query()
       .insert({
           title: 'kaboom'
		})
		.then(function(comic:any){
           console.log(comic);
		})
		.catch(function(error:any){
           console.log('Error!');
           console.log(error);
		});
	
	Comic.query()
       .insert({
           title: 'some comic'
		})
		.then(function(comic:any){
           console.log(comic);
		})
		.catch(function(error:any){
           console.log('Error!');
           console.log(error);
		});
});

router.get('/deleteTestComic', function(req, res, next) {
	Comic.query()
		.delete()
		.then(function (numDeleted) {
			console.log(numDeleted, 'comics were deleted');
		})
		.catch(function (err) {
			console.log(err.stack);
		});
});

router.get('/listUsers', function(req, res) {
	User.query()
	.then(function(users) {
		console.log(users);
	});
});

router.get('/deleteUsers', function(req, res) {
	User.query()
		.delete()
		.then(function (numDeleted) {
			console.log(numDeleted, 'users were deleted');
		})
		.catch(function (err) {
			console.log(err.stack);
		});
});

router.get('/listcomicuser', function(req, res) {
	ComicUser.query()
	.then(function(comicusers) {
		console.log(comicusers);
	});
});

router.get('/listComics', function(req, res) {
    Comic.query()
        .then(function(comics) {
            console.log(comics);
        });
});

export = router;
