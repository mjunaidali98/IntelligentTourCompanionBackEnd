var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
const { text } = require('express');
var User = new Schema({
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  username: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  admin: {
    type: Boolean,
    default: false,
  },
  deleterequest: {
    type: Boolean,
    default: false,
  },
  accounttype: {
    type: String,
    default: 'User',
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: ""
    }
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
