var mongoose = require('mongoose');
var saync = require('async');
var debug = require('debug')(friends-of-friends:friendship);
var relationships = require('../models/relationships');
var utils = require('techjeffharris-utils');

module.exports = function friendshipInit(options) {
  var defaults = {
    accountName: 'Account',
    friendshipName: 'Friendship'
  }

  options = utils.extend(defaults, options);
  debug('options', options);

  var ObjectId = mongoose.Schema.Types.ObjectId;

  var friendship = new mongoose.Schema({
    requester: {type: ObjectId, ref: options.accountName, required: true, index: true},
    requested: {type: ObjectId, ref: options.accountName, required: true, index: true},
    status: {type: String, default: 'Pending', index: true},
    dateSent: {type: Date, default: Date.now, index: true},
    dateAccepted: {type: Date, required: false, index: true}
  });

  FriendshipSchema.statics.getRequests = function(accountId, done) {
    debug('getRequests');

    var self = this;
    var requests = {
      sent: [],
      received: []
    }

    async.parallel({
      sent: function(complete) {
        self.getSentRequests(accountId, complete);
      },
      received: function(complete) {
        self.getReceivedRequests(accountId, complete);
      }
    },
    function(err, results) {
      if(err) return done(err);

      requests.sent = results.sent;
      requests.received = results.received;

      done(null, requests);
    });
  }
}
