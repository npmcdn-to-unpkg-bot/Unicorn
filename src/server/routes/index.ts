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
	console.log(req.body.username);
	
	User
	.query()
	.where('username', req.body.username)
	.then(function (user) {
		if (user.length != 0) {
		
			Comic
			.query()
			.where('id', req.body.comicId)
			.then(function(comic) {
			
				comic[0]
				.$relatedQuery('users')
				.relate(user[0].id);
				
				// also add comic to user
				user[0]
				.$relatedQuery('comics')
				.relate(comic[0].id);
				
			});;
			
		}
	})
	.catch(function (err) {
		console.log(err);
	});
	
});





/* GET sign up page. */
router.get('/signup', function(req, res, next) {
	res.render('signup', { title: 'Sign Up!' });
});

/* GET Contributors page. */
router.get('/contributors', function(req, res) {
	var testuuid1 = uuid.v4();
	var testuuid2 = uuid.v4();

	User.query()
		.insert({
			id: testuuid1,
			username: 'testcontributor'
		})
		.insert()({
			id: uuid.v4(),
			username: 'testNOTacontributor'
		})
		.catch(function(error) {
			console.log("Test users could not be added");
			console.log(error);
		});
	//TEST fake contributor
	ComicUser.query()
		.insert({
			user_id: testuuid1,
			comic_id: testuuid2
		})
		.then(function() {
		})
		.catch(function(error) {
			console.log('Test comic user could not be added!');
			console.log(error);
		});

    User.queryContributors()
		.select('user_id')						// get user_id of all comic users
		.then(function(comic_users_id) {
			return User.query()					// get users who are in list comic uesrs
				.where({
					id: comic_users_id
				}).select()
		})
		.then(function(contributors) {
			ComicUser.query()
				.insert({
					user_id: contributors.id
				})
			//TODO: Make sure there is no existing comic_user 
			res.render('userlist', { "users": contributors });
		})
		.catch(function(error) {
			console.log('Error!');
			console.log(error);
		});

});

/* POST to Add User service */
router.post('/adduser', function(req, res) {
	// https://www.npmjs.com/package/bcryptjs
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(req.body.userpassword, salt, function(err, hash) {
			User.query()
				.insert({
                    //TODO: prevent duplicate username, etc
					username: req.body.username,
					email: req.body.useremail,
					password: hash
				})
				.then(function(user) {
					console.log("Input userid:" + user.id);
					console.log("Input User:" + user.username);
					console.log("Input Email:" + user.email);
					console.log("Input Password:" + user.password);
                    res.redirect('/contributors');
                    //for testing purposes:
				})
                .catch(function(err) {
					console.log('Error!');
					console.log(err);
					// TODO: display an error to the user
				});
		})
	});
});

router.get('/upload', function(req, res, next) {	
	Comic.query()
	.then(function(comics) {
		res.render('upload', { title:'upload'});
	});
});

router.post('/inviteUser', function(req, res, next) {
	
	var comicId = req.body.comicId;
	var comicTitle = req.body.comicTitle;
		
	res.render('invite', {'comicId':comicId, 'comicTitle':comicTitle});
	
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


export = router;
