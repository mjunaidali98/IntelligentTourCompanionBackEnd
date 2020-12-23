var mongoose = require('mongoose');
var schema = mongoose.Schema;
var vehicle = new schema({
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  price: {
    type: String,
    default: '',
  },
  pricewithDriver: {
    type: String,
  },
  capacity: {
    type: String,
    default: '',
  },
  featured: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('Vehicle', vehicle);
