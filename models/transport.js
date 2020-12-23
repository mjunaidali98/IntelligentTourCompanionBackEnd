var mongoose = require('mongoose');
var schema = mongoose.Schema;
var transport = new schema({
  nicno: {
    type: Number,
  },
  userid: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  vehicles: [
    {
      vehiclereg: {
        type: String,
        default: '',
      },
      vehicleno: {
        type: Number,
      },
      companyname: {
        type: String,
        //required: true,
        default: '',
      },
      modelname: {
        type: String,
        // required: true,
        default: '',
      },
      modelyear: {
        type: String,
        //required: true,
      },
      image: {
        type: String,
        default: '',
      },
      available: {
        type: Boolean,
        default: true,
      },
      priceWithDriver: {
        type: String,
        default: '',
      },
      priceWithoutDriver: {
        type: String,
        default: '',
      },
    },
  ],
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  approved: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transport', transport);
