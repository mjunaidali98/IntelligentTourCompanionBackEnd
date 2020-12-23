var mongoose = require('mongoose');
var schema = mongoose.Schema;
var topDestinations = new schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: { type: Array },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('TopPlace', topDestinations);
