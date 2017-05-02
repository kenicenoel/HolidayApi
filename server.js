//  get the required modules
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Get API Routes from routes file
app.use(require('./routes')); 
var port = process.env.PORT || 3000;

app.listen(port);

