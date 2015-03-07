var express = require('express');
var passport = require('passport');

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
  // registration
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
      successRedirect: '/test',
      failureRedirect: '/login',
      failureFlash: false
    })
  
  );
  
  app.get('/login', function(req,res){
    res.render("login", {user: req.user, messages: "error"})
  });
  
  //post log out
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });
  
  function ensureAuthenticated(req, res, next){
    console.log(req.user)
    console.log(req.isAuthenticated())
    if(req.isAuthenticated()){
      return next();
    }
    res.redirect('/login');
  }
}
module.exports = Routes;