//  get the required modules
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config'); // get our config file
var cors = require('cors');
var mongoose = require('mongoose');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

var app = express();
// get an instance of the router for api routes
var apiRoutes = express.Router();
app.use(cors());
apiRoutes.use(cors());

app.use(function(request, response, next) 
{
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

apiRoutes.use(function(request, response, next) 
{
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('superSecret', config.secret); // secret variable
var port = process.env.PORT || 3000; // used to create, sign, and verify tokens


// Use the models which are blueprints for the Database document objects
var Holiday = (require('./models/holiday')); //get our holiday model
var User   = require('./models/user'); // get our mongoose model

// connect to the Mongo database using mongoose
var db = mongoose.connect(config.database);




// handle Get requests from clients
apiRoutes.get('/', function (request, response, next) 
{
	response.send("Welcome to the Caribbean Holidays API.\nVersion: v1\nAccess: /api/v1/holiday/");
});



// A list of holidays for all countries
apiRoutes.get('/holiday', function (request, response, next) 
{
	Holiday.find({}, function(err, holidays)
	{
		if(err)
		{
			response.status(500).send({error: "Something went wrong. Error: "+err});
		}

		else if(holidays.length == 0)
		{
			response.send("There aren't any holidays available.");
		}
		else
		{
			response.send(holidays);
		}
		

	});
	
});

// A list of holidays for specific country
apiRoutes.get('/holiday/:country', function (request, response, next) 
{
	var filterCountry = request.params.country;
	Holiday.find({'country': filterCountry}, function(err, holidays)
	{
		if(err)
		{
			response.status(500).send({error: "Something went wrong. Error: "+err});
		}

		else if(holidays.length == 0)
		{
			response.send("There aren't any holidays available for the specified country.");
		}
		else
		{
			response.send(holidays);
		}
		

	});
	
});


/***************************************** POST ******************************** */
// Handle post requests from clients


// Create a user
apiRoutes.post('/setup', function(request, response, next)
{
	var email = request.body.email;
	var password = request.body.password;
	var fullName = request.body.fullName;

	// find the user
  User.findOne
  ({email: email}, function(err, user) 
  {
    if (err)
	{
		response.status(500).send({success: false, message: "Something went wrong. Error: "+err});
	} 

    if (!user) // No user already exists for that email
	{
      	// create a sample user
		var user = new User({ 
		email: email, 
		password: password,
		name: fullName,
		admin: false 
  });

  // save the sample user
  user.save(function(err) 
  {
     if (err)
	{
		response.status(500).send({success: false, message: "Something went wrong. Error: "+err});
	} 
    console.log('User saved successfully');
	  var token = jwt.sign(user, app.get('superSecret'), 
		{
          expiresInMinutes: 28800  // expires in 20 days
        });

    
    response.send
	({ 
		success: true, 
		message: 'Your account was created and your token is displayed below. Please write down this token as it won\'t be displayed again. Tokens expire after 20 days',
		token: token
	 });
  });
    } 
	else if (user) // A User with email already exists
	{
		response.send({ success:false, message: 'A user with that email already exists. try logging in.' });
	}

  });
	


});



// Authentication
apiRoutes.post('/authenticate', function(request, response, next)
{
	// find the user
  User.findOne
  ({name: request.body.name}, function(err, user) 
  {
    if (err)
	{
		response.status(500).send({error: "Something went wrong. Error: "+err});
	} 

    if (!user) 
	{
      response.send({ success: false, message: 'Authentication failed. User not found.' });
    } 
	else if (user) 
	{
      // check if password matches
      if (user.password != request.body.password) 
	  {
        response.send({ success: false, message: 'Authentication failed. Wrong password.' });
      } 
	  else 
	  {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), 
		{
          expiresInMinutes: 7200 // expires in 120 hours or 5 days
        });

        // return the information including token as JSON
        response.send({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });

    
});


/////////// ANY ROUTE DEFINED AFTER THIS SECTION WILL REQUIRE TOKEN AUTHENTICATION FOR ACCESS TO THESE ROUTES ///////

	// route middleware to verify a token
apiRoutes.use(function(request, response, next) 
{

  // check header or url parameters or post parameters for token
  var token = request.body.token || request.query.token || request.headers['x-access-token'];

  // decode token
  if (token) 
  {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) 
	{      
      if (err) 
	  {
        return response.json({ success: false, message: 'Failed to authenticate token.' });    
      } 
	  else 
	  {
        // if everything is good, save to request for use in other routes
        request.decoded = decoded;    
        next();
      }
    });

  } 
  else 
  {

    // if there is no token
    // return an error
    return response.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
});





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


apiRoutes.post('/holiday', function (request, response, next) 
{
	

	// Check if it is empty or missing required data fields
	if (!request.body.name || !request.body.country || !request.body.date || request.body.name == "" || request.body.country == "" || request.body.date == "") {
		response.status(500).send({
			error: "To submit a holiday, you must supply the country, date and name. "
		});
	} 
	else 
	{
		var holiday = new Holiday();
		holiday.name = request.body.name;
		holiday.date = request.body.date;
		holiday.country = request.body.country;
		holiday.save(function(err, savedHoliday)
		{
			if(err)
			{
				response.status(500).send({error: "Something went wrong and the holiday could not be saved. Error: "+err});
			}
			else
			{
				response.status(200).send(savedHoliday);
			}
		});

	}
});




/* ************************** PUT ****************************/

// Handle update requests from the client for the id specified after the / in the url. 
apiRoutes.put('/holiday/:id', function (request, response, next) 
{
	var holidayId = request.params.id; // grab the specified id from the url (:/id)
	var newName = request.body.name;
	var newDate = request.body.date;
	var newCountry = request.body.country;
	var objectFound = false;

	// If data supplied is missing any key or the data for the key is empty send error response
	if ((!newName || newName == "") || (!newDate || newDate == "") || (!newCountry || newCountry == "")) 
	{
		response.status(500).send({
			error: "You must specify a valid name, date and country for the update to work"
		});
	}
	else 
	{
		Holiday.findById(holidayId, function(err, holiday)
		{
			if(err)
			{
				response.status(500).send({error: "Something went wrong. Error: "+err});
			}

			else
			{
				holiday.country = newCountry;
				holiday.date = newDate;
				holiday.name = newName;

				holiday.save(function(err, holiday)
				{
					if(err)
					{
						response.status(500).send({error: "Something went wrong. Error: "+err});
					}

					else
					{
						response.status(200).send(holiday);
					}
				});

			
			}
		});
		
		
	}
	
});


/**********************  DELETE *****************/

// Handle delete requests from the client for the id specified after the / in the url. 

apiRoutes.delete('/holiday/:id', function (request, response, next) 
{
	var holidayId = request.params.id; // grab the specified id from the url (/:id)
	Holiday.findByIdAndRemove(holidayId, function (err, holiday) 
	{  
		// We'll create a simple object to send back with a message and the id of the document that was removed
		// You can really do this however you want, though.
    	var success = 
		{
        	message: "Holiday successfully deleted",
        	id: holiday._id
    	};
    response.send(success);
});

	


});



// apply the routes to our application with the prefix /api
app.use('/api/v1', apiRoutes);


app.listen(port, function()
{
	console.log("Holiday API running on port "+port+".");
});


