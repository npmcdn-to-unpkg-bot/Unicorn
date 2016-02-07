//import express = require('express');
//import router = express.Router();
import * as express from 'express';
const router = express.Router();
var app = express();
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
export default app;
