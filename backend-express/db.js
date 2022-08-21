const mongoose = require('mongoose');
const logger = require('./logger');

const userSchema = mongoose.Schema({
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true},
})


module.exports = function() {
  logger.info(`Connecting to ${process.env.MONGO_URL}`)
  const conn = mongoose.createConnection(process.env.MONGO_URL )
  return conn
}
