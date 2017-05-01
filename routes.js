var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var Holiday = (require('./model/holiday'));

// connect to the Mongo database using mongoose
var db = mongoose.connect('mongodb://localhost/holiday-api');

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) 
{
  console.log('Time: ', Date.now());
  next();
});




// handle Get requests from clients
router.get('/', function (request, response) 
{
	response.send("Welcome to our Holiday API.");
});

// A list of holidays for all countries
router.get('/holiday', function (request, response) 
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
router.get('/holiday/:country', function (request, response) 
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

router.post('/holiday', function (request, response) 
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
router.put('/holiday/:holidayId', function (request, response) {
	var holidayId = request.params.id; // grab the specified id from the url (:/holidayId)
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
router.delete('/holiday/:holidayId', function (request, response) 
{
	var holidayId = request.params.id; // grab the specified id from the url (:/holidayId)
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


module.exports = router;



