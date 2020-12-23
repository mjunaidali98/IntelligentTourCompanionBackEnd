var mongoose = require('mongoose');
var schema = mongoose.Schema;
var Trips = new schema({
  locationTimeInterval: {
    type: Array,
  },
  poiTimeIntervals: {
    type: Array,
  },
  tripDays: {
    type: Number,
  },
  tourStartDate: {
    type: String,
  },
  tourEndDate: {
    type: String,
  },
  currentDate: {
    type: String,
  },
  selectedPoiPosition: {
    type: Array,
  },
  inputDetails: {
    type: Object,
  },
  hotelToFirstPoiTime: {
    type: String,
  },
  poiToHotelTime:{
    type: Array,
  },
  startTime: {
    type: String,
  },
  selectedHotel: {
    type: Object,
  },
  selectedPoi: {
    type: Object,
  },
  allTourDates: {
    type: Array,
  },
  tourDay: {
    type: String,
  },
  totalDays:  {
    type: String,
  },
  stayTime: {
    type: String,
  },
  transportType: {
    type: String,
  },
  userid: {
      type: String,
  },
  fuelCost: {
    type: Number,
},
hotelPrice: {
  type: Number,
},
vehiclePrice: {
  type: Number,
},
budget: {
  type: Number,
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
}
});
module.exports = mongoose.model('Trips', Trips);
