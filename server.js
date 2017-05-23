//  get the required modules
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config'); // get our config file

var app = express();
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('superSecret', config.secret); // secret variable

//Get API Routes from routes file
app.use(require('./routes')); 

app.listen(port, function()
{
	console.log("Holiday API running on port "+port+".");
});


