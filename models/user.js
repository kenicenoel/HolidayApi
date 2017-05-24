var  mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema
({
	email: String,
	password: String,
	admin: Boolean
});

module.exports = mongoose.model("User", user);