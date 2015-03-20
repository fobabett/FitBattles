var mongoose = require('mongoose');
var crypto = require('crypto');

var ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = mongoose.Schema({
  username: String,
  password: String,
  startingWeight: Number,
  currentWeight: Number,
  goalWeight: Number,
  friends: Array
});

userSchema.methods.validPassword = function (check_password) {
  return (passwordCrypt(check_password) === this.password);
};

function passwordCrypt(password) {

  var salt = process.env.SALT;
    var user_password = password;
    var salted_user_password = user_password + salt; 
    var shasum = crypto.createHash('sha512');
    shasum.update( salted_user_password );
    var input_result = shasum.digest('hex');
  
    return input_result
}

var User = mongoose.model('users', userSchema);

module.exports = User;