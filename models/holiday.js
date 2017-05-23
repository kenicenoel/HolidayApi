var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var holiday = new Schema
({
		name: String,
		date: String,
		country: String
});

module.exports = mongoose.model("Holiday", holiday);