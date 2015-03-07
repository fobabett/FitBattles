var express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser')
LocalStrategy = require('passport-local').Strategy;


// middleware
app.use(bodyParser.urlencoded({ extended: true }));
// app.engine('html', require('jade').__express);
// app.set('view engine', 'html');
// app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/')); 
app.use(passport.initialize());
app.use(passport.session());
module.exports = app;


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username}, function(err, user) {
      if(err) { 
        return done(err);
      }
      if(!user) {
        return done(null, flase, { message: 'Incorrect username.'});
      }
      if(!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password'});
      }
      return done(null, user);
    });
  }
));

app.get('/', function(req, res) {
  res.send('Hello World');
}); 

var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port);
});