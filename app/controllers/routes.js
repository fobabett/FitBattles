var express = require('express');
var passport = require('passport');
var User = require('../models/user');
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

  // gets current and goal weight from user
  app.put('/home', function(req,res) {
     User.findOne(function(err, user){
      if (err) {
        return err;
      };
      if (user){
        res.send("weight loss goals saved")
        user.currentWeight = req.body.currentWeight;
        user.goalWeight = req.body.goalWeight;

        user.save(function(err, user) {
          if (err){
            throw err;
          }
          // res.redirect('/');
        })
      } 
    });
  });
  
  function ensureAuthenticated(req, res, next){
    console.log(req.user)
    console.log(req.isAuthenticated())
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