import * as express from 'express';
const router = express.Router();

import {Comic} from '../models/Comic';
import {User} from '../models/User';

var multer  = require('multer')

var storage =   multer.diskStorage({
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
    // Proof-of-concept code for inserting a new comic in the database
    //
    //Comic.query()
    //    .insert({
    //        title: 'kaboom'
    //    })
    //    .then(function(comic:any){
    //        console.log(comic);
    //    })
    //    .catch(function(error:any){
    //        console.log('Error!');
    //        console.log(error);
    //    });
    res.render('index', { title: 'Unicorn Comics!' });
});

/* GET sign up page. */
router.get('/signup', function(req, res, next) {
	res.render('signup', { title: 'Sign Up!' });
});

/* POST to Add User service */
router.post('/adduser'), function(req, res, next) {
	User.query()
		.insert({

		});
		
}

router.get('/listcomics', function(req, res, next) {
	
	Comic.query()
	.then(function(comics) {
		res.render('listcomics', { "comics": comics});
	});
	
});

router.get('/upload', function(req, res, next) {
	
	Comic.query()
	.then(function(comics) {
		res.render('upload', { title:'upload'});
	});
	
});



router.get('/createuser', function(req, res, next) {
	res.render('createuser', { title: 'Development use: Add user'});
});

router.post('/adduser', function(req, res) {
	
	var userName = req.body.username;
	
	User.query()
	.insert({
		username: userName
	})
	.then(function(user:any){
		console.log(user);
		})
	.catch(function(error:any){
		console.log('Error!');
		console.log(error);
	});
	
});

router.get('/inviteUser', function(req, res, next) {
	
	var comicId = req.body.comicId;
	
	res.render('invite', {'comicId':comicId});
	
});

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

router.get('/viewcomic', function(req, res, next) {
	
	Comic.query()
	.where('id', req.query.comicId)
	.then(function(comic) {
		res.render('viewcomic', {"comic": comic});
	});
	
});

export = router;
