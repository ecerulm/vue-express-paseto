const mongoose = require('mongoose');
const logger = require('./logger');
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
})

userSchema.pre('save', function(next) {
  const user = this;
  
  if (!user.isModified("password")) return next(); // only run if password changed

  bcrypt.genSalt().then(salt => {
    return bcrypt.hash(user.password, salt);
  }).then(hash => {
    user.password = hash;
    return next();
  }).catch((err) => {
    return next(err);
  });
});

userSchema.methods.comparePassword = function(inputPassword) {
  return bcrypt.compare(inputPassword, this.password)
}


module.exports = function() {
  logger.info(`Connecting to ${process.env.MONGO_URL}`);
  const conn = mongoose.createConnection(process.env.MONGO_URL);
  conn.model('User', userSchema);
  
  return conn;
}
