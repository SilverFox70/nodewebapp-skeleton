var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	name: String,
	email: String,
	isAdmin: Boolean
});

mongoose.model('User', userSchema);