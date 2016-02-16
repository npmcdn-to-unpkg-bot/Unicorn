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
    callback(null, './public/img');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage : storage}).single('uploadImage');

router.post('/saveImage',function(req,res){
    upload(req,res,function(err) {
        if(err) {
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
		
		return ComicUser.query().insert({
			user_id: user[0].id,
			comic_id: req.body.comicId
		});
		
	})
	.then(function (comicUser:ComicUser) {
        res.redirect('/comics/' + comicUser.comic_id + '/edit');
    })
	.catch(function (err) {
		console.log(err);
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

router.get('/trycookie', function(req, res, next) {
	
	req.cookies = {userName:'John',passWord:'somepass'};
	//req.cookies = "username=John Doe:password=somepass";
	console.log("Cookies: ", req.cookies);
	
});

router.get('/fakelogin', function(req, res, next) {
	
	req.cookies = {userName:'john',id:'95833617-57d7-420f-adba-a2e96d6f908a'};
	console.log("Cookies: ", req.cookies);
	
});

router.get('/fakelogout', function(req, res, next) {
	
	req.cookies = {};
	console.log("Cookies: ", req.cookies);
	
});

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


export = router;
