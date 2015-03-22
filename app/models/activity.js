var mongoose = require('mongoose');
var crypto = require('crypto');

var activitySchema = mongoose.Schema({
  user: String,
  body: String,
  weightLost: Number,
  date: {type: Date, default: Date.now}
});

var Activity = mongoose.model('activities', activitySchema);

module.exports = Activity;