var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const { text } = require('express');
var Contactus = new Schema({
  email: {
    type: String,
  },
  subject: {
    type: String,
  },
  text: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contactus', Contactus);
