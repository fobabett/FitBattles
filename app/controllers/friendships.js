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

  FriendshipSchema.statics.getSentRequests = function(accountId, done) {
    debug('getSentRequests')

    var conditions = {
      requester: accountId,
      status: 'Pending'
    }

    this.find(conditions, done);
  }

  FriendshipSchema.statics.acceptRequest = function(accountId1, accountId2, done) {
    debug('acceptRequest')
    debug('accountId1', accountId1)
    debug('accountId2', accountId2)

    var conditions = {
      '$or': [
        {requester: accountId1, requested: accountId2},
        {requester: accountId2, requested: accountId1}
      ],
      status: 'Pending'
    }

    var updates = {
      status: 'Accepeted',
      dateAccepted: Date.now()
    }

    this.findOneAndUpdate(conditions, updates, function(err, friendship) {
      if(err) {
        done(err);
      } else if(friendship) {
        done(null, friendship);
      } else {
        done(new Error('Cannot accept request that does not exist!'));
      }
    });
  }

  // get list of friends on account
  FriendshipSchema.statics.getFriends = function(accountId, done) {
    debug('GetFriends');

    var friendIds = [];

    var conditions = {
      '$or': [
        {requester: accountId},
        {requested: accountId}
      ],
      status: 'Accepted'
    }

    this.find(conditions, function(err, friendships) {
      if(err) {
        done(err);
      } else {
        debug('friendships', friendships);

        friendships.forEach(function(friendship) {
          debug('friendship', friendship);

          if(friendship.requester.equals(accountId)) {
            friendIds.push(friendship.requested);
          } else {
            friendIds.push(friendship.requester);
          }
        });
        debug('friendIds', friendIds);
        done(null, friendIds);
      }
    });
  }
}
