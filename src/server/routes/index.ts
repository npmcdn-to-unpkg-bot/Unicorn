import * as express from 'express';
const router = express.Router();

import {Comic} from '../models/Comic';

/* GET home page. */
router.get('/', function(req, res, next) {
    // Proof-of-concept code for inserting a new comic in the database

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
    res.render('index', { title: 'Express' });
});

export = router;
