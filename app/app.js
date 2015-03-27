var config = require('./config.json');
var express = require('express');
var app = express();
var passport = require('passport');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var secret = process.env.DBPASS;
var session = require('express-session');
var Schema = mongoose.Schema;
var methodOverride = require('method-override');
mongoose.connect(config.databaseURI);
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var logger = require('morgan');
var cors = require('cors');


app.use(session(
{
  secret: config.secret,
  resave: false,
  saveUninitialized: true
}));

// middleware
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('html', require('jade').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/')); 
app.use(passport.initialize());
app.use(passport.session());
app.use(logger("dev"));
module.exports = app;
app.use(cors());


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
        return done(null, false, { message: 'Incorrect username.'});
      }
      if(!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password'});
      }
      return done(null, user);
    });
  }
));

app.post('/validateUser', function(req, res) {
  User.findOne ({
    username: req.body.username, 
    password: User.passwordCrypt(req.body.password)
  }, 
  function (err, user) {
    if (user) {
      res.json({ success: true });
    } else {
      res.json({ success: false });    
    }
  });
});

var Routes = require('./controllers/routes');
Routes(app);


var server = app.listen(config.port, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port)
});