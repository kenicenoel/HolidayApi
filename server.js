//  get the required modules
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config'); // get our config file
var cors = require('cors');

var app = express();
app.use(cors());
// app.use(function(request, response, next) 
// {
//   response.header("Access-Control-Allow-Origin", "*");
//   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('superSecret', config.secret); // secret variable
var port = process.env.PORT || 3000; // used to create, sign, and verify tokens


//Get API Routes from routes file
app.use(require('./routes')); 



app.listen(port, function()
{
	console.log("Holiday API running on port "+port+".");
});


