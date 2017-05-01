//  get the required modules
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Get API Routes from routes file
app.use(require('./routes')); 

app.listen(5000, function()
{
	console.log("Holiday API running on port 5000.");
});


