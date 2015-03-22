var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Activity = require('../models/activity');
var crypto = require('crypto');

var Routes = function(app) {

  function get(url){
    return new Promise(function(resolve,reject){
      var req = new XMLHttpRequest();
      req.open('GET',url);
      req.onload = function(){
        if (req.status === 200){
          resolve(req.response);
        }
        else {
          reject(Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(Error("Network Error"));
      };
      req.send();
    });
  }

  app.get('/', function(req, res) {
    res.render("index.jade");
  });

  app.get('/login', function (req, res) {
    //res.render("login", { user: req.user, messages: req.flash('error') });
    res.render("login.jade")
  });
  
  
  app.get('/home', ensureAuthenticated, function (req, res){
    res.render("home.jade")
  });
  
  app.get('/registration', function (req, res){
    res.render("registration.jade")
  });

// feed of user's and friends weightloss and points
  app.get('/feed', function (req, res) {
    User.findOne(function(err, user) {
      if(err) {
        return err;
      }
      if(user) {
        Activity.find({}, function(err, docs) {
          for (var i = 0; i < docs.length; i++) {
            var weight = docs[i].weightLost;
            var user = docs[i].user;
          };
          
          res.render('feed.jade', {
            activity: docs,
            weightLost: weight,
            username: user
          })
        })
      }
    })
    
    
    
  })
  
  //Saves user registration info
  
  //checking if username exists
  app.post('/registration', function (req, res){
  
    
    User.findOne({username: req.body.username}, function(err, user){
      if (err) {
        return err;
      };
      if (user){
        res.send("User ID Already Exists")
      } else{
        req.body.password = passwordCrypt(req.body.password);
    
        var user = new User(req.body);
        user.save(function (err, user){
          if (err){
            throw err;
          }
          res.redirect('/');
        })    
      }
    });
  });
  
  //post request authentication
  app.post('/login',
    passport.authenticate('local', {
      successRedirect: '/home',
      failureRedirect: '/login',
      failureFlash: false
    })
  
  );
  
  
  //post log out
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });

  app.get('/progress', function(req, res){
    User.findOne(function(err, user) {
      if(err) {
        throw err;
      }
      console.log(req.user.currentWeight);

    })
    var weightLeft = req.user.currentWeight - req.user.goalWeight;
    var health = req.user.startingWeight - req.user.goalWeight;
    var attack = health - req.user.currentWeight; 


    res.render('progress.jade', {
      startingWeight: req.user.startingWeight,
      currentWeight: req.user.currentWeight,
      goalWeight: req.user.goalWeight,
      username: req.user.username,
      weightToGo: weightLeft,
      health: health,
      attack: attack
    })
  });

  app.post('/progress', function(req,res) {
    User.findOne(function(err, user) {
      
      if(err) {
        return err;
      }
      if(user) {
        var activity = new Activity(req.body);
  
        activity.user = req.body.user;
        activity.user = req.user.username;
        activity.weightLost = req.body.weightLost;
        activity.weightLost = req.user.weightLost;
        activity.date = req.body.date;
    
        activity.save(function(err, activity) {
          if(err) {
            throw err;
          }
        });

        var lastWeight = req.body.currentWeight;

        req.user.currentWeight = req.body.currentWeight;
        req.user.weightLost = req.body.weightLost;
        req.user.weightLost = lastWeight - req.user.currentWeight;

        req.user.save(function(err, user) {
          if(err) {
            throw err;
          }
          res.redirect('/progress');
          console.log('new weight saved to: ', req.user.username);
        })
      }
    })
  })




  // gets current and goal weight from user
  app.post('/home', function(req,res) {
     User.findOne(function(err, user){
      if (err) {
        return err;
      };
      if (req.user){
        req.user.startingWeight = req.body.startingWeight;
        req.user.goalWeight = req.body.goalWeight;
        req.user.currentWeight = req.body.startingWeight;

        req.user.save(function(err, user) {
          if (err){
            throw err;
          }
          res.redirect('/progress');
          console.log('saved to: ',req.user.username);
        })
      } else {
        res.send(404);
      } 
    });
   
  });

  
  function ensureAuthenticated(req, res, next){
    console.log('login: ',req.user.username)
    // console.log(req.isAuthenticated())
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  }

  function passwordCrypt(password) {

  var salt = process.env.SALT;
    var user_password = password;
    var salted_user_password = user_password + salt; 
    var shasum = crypto.createHash('sha512');
    shasum.update( salted_user_password );
    var input_result = shasum.digest('hex');
  
    return input_result
  }
}
module.exports = Routes;