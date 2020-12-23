var express = require('express');
var router = express.Router();
const TopPlaces = require('../models/topDestinations');
var authenticate = require('../authenticate');
const bodyParser = require('body-parser');
var User = require('../models/user');
var nodemailer = require('nodemailer');
var passport = require('passport');
const contactus = require('../models/contactus');
const transport = require('../models/transport');
const Trips = require('../models/trips');
var currentuser = '';
var multer = require('multer');
const cors = require('./cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const guide = require('../models/guide');
var Vehicles = require('../models/vehicles');
var Tags = require("../models/tag")



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/vehicle/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});

var upload = multer({ storage: storage }).single('image');

router.use(bodyParser.json());

var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: 'itourcompanion@gmail.com',
    pass: 'siddiqui1',
  },
});

/* GET users listing. */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    res.json(req.user);
  }
);

//UserRegister and Authenticate
router.post('/sendOTP', (req, res, next) => {
  const { email } = req.body;
  const { username } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({ error: ' User Email already' });
    } else {
      var randomnumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
      var mailOptions = {
        from: '"Intelligent Tour Companion👻" <itourcompanion@gmail.com>',
        to: email,
        subject: 'Account Activation Code',
        html:
          '<h3>Your verification code is:</h3><h1><b>' +
          randomnumber +
          '</b></h1>',
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        status: 'Successfull !!',
        code: randomnumber,
      });
    }
  });
});

router.post('/savetoDatabase', (req, res, next) => {
  const { email } = req.body.email;
  const { username } = req.body.username;

  User.register(
    {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      admin: req.body.admin,
      tags: req.body.tags
    },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log('register' + err);
        res.statusCode = 400;
        res.json({ err: err, success: false });
      } else {
        let authenticate = User.authenticate();
        authenticate(req.body.username, req.body.password, (errr, result) => {
          if (errr)
            res.json({
              statusCode: 500,
              message: errr,
            });
          else {
            res.json({
              message: 'Registered Successfully',
              user: result,
            });
          }
        });
      }
    }
  );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  loginId = req.user._id;
  currentuser = req.user;
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    success: true,
    token: token,
    status: 'You are successfully logged in!',
    user: req.user,
    admin: req.user.admin,
  });
});

//Change password
router.route('/changepass').post((req, res, next) => {
  currentuser.changePassword(
    req.body.oldpassword,
    req.body.newpassword,
    function (err) {
      if (err) {
        return next(err);
      } else console.log('Password change sucessfully');
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.json({
        success: false,
        status: 'Password Matched',
      });
    }
  );
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

//contactus ROute
router.route('/contactus').post((req, res, next) => {
  contactus.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

//deactivate account

router.route('/deactivate').post((req, res, next) => {
  if (currentuser.deleterequest) {
    return next(err);
  } else {
    currentuser.deleterequest = req.body.deleterequest;
    currentuser.save(function (err) {
      if (err) {
        console.log('Error');
      } else {
        console.log('Sucess');
      }
    });
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.json({
      success: true,
      status: 'Account Ready for deletion',
    });
  }
});

/* GET home page. */
router.get('/viewTopPlaces', function (req, res, next) {
  TopPlaces.find({}, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});

//userdetails
router.route('/transport').post((req, res, next) => {
  transport.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

//Add new vehicle to previous one
router.route('/addvehicle').post((req, res, next) => {
  var id = currentuser._id.toString();
  console.log('recieved is ' + req.body.vehicles[0].companyname);
  transport.find({ userid: id }, function (err, data) {
    if (err) console.log(err);
    else {
      var thisuser = data;
      console.log('current user details' + thisuser);
      thisuser[0].vehicles.push(req.body.vehicles[0]);
      console.log('Final user is :' + thisuser);
      transport.updateOne(
        { userid: id },
        { vehicles: thisuser[0].vehicles },
        function (err, result) {
          if (err) console.log(err);
          else {
            console.log('Vehicle added sucessfully');
            res.status(200).send();
          }
        }
      );
    }
  });
});

//persontransportdetails
router.get('/transportdetails', function (req, res) {
  transport.find({ userid: currentuser._id }, function (err, data) {
    if (err) {
      console.log(err);
      res.status(400).json({
        success: 0,
        error: 'Failed loading transport details',
      });
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

//DeleteVehicle
router.delete('/deletevehicle/:id', function (req, res) {
  console.log('zee' + req.params.id);
  transport.update(
    { userid: currentuser._id },
    { $pull: { vehicles: { _id: req.params.id } } },

    function (err, result) {
      if (err) {
        console.log('cannot remove this shit');
        return console.error(err);
      } else {
        console.log('Vehicle successfully removed from polls collection!');
        res.status(200).send();
      }
    }
  );
});

//deleteuserdetails
router.delete('/deleteuserdetails/:id', function (req, res) {
  console.log('id:' + JSON.stringify(req.body));
  transport.remove({}, { $pull: { userid: req.body } }, (error, data) => {
    if (error) {
      return error;
    } else {
      console.log('Remove success!');
      res.status(200).json({
        msg: data,
      });
    }
  });
});

//edit user details for vehicles
router.post('/edittransportdetails', function (req, res) {
  transport.findOneAndUpdate(
    { userid: currentuser._id },
    {
      nicno: req.body.nicno,
      phone: req.body.phone,
      city: req.body.city,
      address: req.body.address,
      email: req.body.email,
    },
    function (err, result) {
      if (err) {
        console.log('cannot update the user details');
        return console.error(err);
      } else {
        console.log('User vehicles are sucessfully upadted');
        console.log(result);
        res.status(200).send();
      }
    }
  );
});

//editvehicledetails

router.post('/editvehicledetails', function (req, res) {
  console.log('id: ' + req.body.vehicleId);
  transport.findOneAndUpdate(
    { userid: currentuser._id, 'vehicles._id': req.body.vehicleId },
    {
      $set: {
        'vehicles.$.companyname': req.body.companyname,
        'vehicles.$.modelname': req.body.modelname,
        'vehicles.$.priceWithoutDriver': req.body.priceWithoutDriver,
        'vehicles.$.image': req.body.image,
        'vehicles.$.modelyear': req.body.modelyear,
        'vehicles.$.vehiclereg': req.body.vehiclereg,
        'vehicles.$.priceWithDriver': req.body.priceWithDriver,
      },
    },
    function (err, result) {
      if (err) {
        console.log('cannot update the user details');
        return res.status(400).json({
          err,
        });
      } else {
        console.log('User Vehicle details are sucessfully upadted');
        res.status(200).json({
          success: true,
          result,
        });
      }
    }
  );
});

//change availibity of the vehicles by user

router.post('/vehicleisavailable', function (req, res) {
  console.log('id: ' + req.body.vehicleId);
  console.log('available: ' + req.body.available);
  transport.findOneAndUpdate(
    { userid: currentuser._id, 'vehicles._id': req.body.vehicleId },
    {
      $set: {
        'vehicles.$.available': req.body.available,
      },
    },
    function (err, result) {
      if (err) {
        console.log('cannot update the user details');
        return console.error(err);
      } else {
        console.log('User Vehicle details are sucessfully upadted');
        res.status(200).send();
      }
    }
  );
});

//search transport across the country
router.get('/searchtransport', function (req, res) {
  console.log('city: ' + req.body.city);
  transport.find({ city: req.body.city }, function (err, data) {
    if (err) console.log(err);
    else {
      console.log('Data is ' + data);
      res.json(data);
    }
  });
});

//Guide Routes are stated as

router.get('/guideDetail', function (req, res) {
  guide.find({ userid: loginId }, function (err, data) {
    if (err) console.log(err);
    else {
      res.json(data);
      console.log(loginId);
      console.log(data);
    }
  });
});

router.route('/addQuideDetails').post((req, res, next) => {
  const newGuide = {
    phone: req.body.phone,
    email: req.body.email,
    fullname: req.body.fullname,
    nicno: req.body.nicno,
    city: req.body.city,
    address: req.body.address,
    userid: req.body.userid,
    requestSent: req.body.requestSent,
  };
  guide.create(newGuide, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

router.route('/deleteGuide/:id').delete((req, res, next) => {
  var id = req.params.id;
  guide.findByIdAndDelete(id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});
router.route('/updateAvailability/:id').post(async (req, res, next) => {
  let gotGuide = await guide.findOne({ _id: req.params.id });
  if (!gotGuide) {
    res
      .statusCode(500)
      .json({ success: false, message: 'could not find guide' });
  } else {
    let newValue = !gotGuide.availability;
    console.log(!gotGuide.availability);
    gotGuide = await guide.findOneAndUpdate(
      { _id: req.params.id },
      { availability: newValue },
      { useFindAndModify: false }
    );
    if (gotGuide) {
      res.json({
        sucess: true,
        message: 'Guide updated successfully',
        guide: gotGuide,
      });
    } else {
      res
        .statusCode(500)
        .json({ success: false, message: 'Could not update guide' });
    }
  }
});

router.get('/guide/:city', function (req, res, next) {
  var city = req.params.city;
  guide.find({ city: city }, (error, data) => {
    if (error) {
      console.log(error);
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

//Trips saving 

router.route('/addTrip').post((req, res, next) => {

  const tourObject = {
    locationTimeInterval: req.body.locationTimeInterval,
    poiTimeIntervals: req.body.poiTimeIntervals,
    tripDays: req.body.tripDays,
    tourStartDate: req.body.tourStartDate,
    tourEndDate: req.body.tourEndDate,
    currentDate: req.body.currentDate,
    selectedPoiPosition: req.body.selectedPoiPosition,
    inputDetails: req.body.inputDetails,
    hotelToFirstPoiTime: req.body.hotelToFirstPoiTime,
    startTime: req.body.startTime,
    selectedPoi: req.body.selectedPoi,
    selectedHotel: req.body.selectedHotel,
    poiToHotelTime: req.body.poiToHotelTime,
    allTourDates: req.body.allTourDates,
    tourDay: req.body.tourDay,
    totalDays: req.body.totalDays,
    stayTime: req.body.stayTime,
    transportType: req.body.transportType,
    userid: req.body.userid,
    hotelPrice: req.body.hotelPrice,
    fuelCost: req.body.fuelCost,
    vehiclePrice: req.body.vehiclePrice,
    budget: req.body.budget,
    tags: req.body.tags,

  };
  Trips.create(tourObject, (error, data) => {
    if (error) {
      return next(error);
    } else {
      console.log(data);
      res.json(data);
    }
  });
});

//view tours 
router.get('/viewtours', function (req, res) {
  Trips.find({ userid: currentuser._id }, function (err, data) {
    if (err) console.log(err);
    else {
      res.json(data);
      console.log(data);
    }
  });
});

//delete tour

router.delete('/deletetour/:id', function (req, res) {
  Trips.remove(
    {
      _id: req.params.id,
    },
    function (err, user) {
      if (err) {
        return console.error(err);

      }
      console.log('Tour is successfully removed from polls collection!');
      res.status(200).send();
    }
  );
});

//userplantrip vehicles

router.get('/getTransport', (req, res) => {

  Vehicles.find({}, (err, results) => {
    if (err) {
      console.log(err)
      res.status(400).json({
        success: 0,
        error: "Cannot Get transport"
      })
    }
    res.status(200).json({
      results,
      message: 'data found',
    });
  });
});

router.get("/getTags", (req, res) => {

  let tagWeather = [];
  let tagHotels = [];
  let tagLocations = [];
  let tagTrips = [];
  Tags.find({}, (err, results) => {
    if (err) {
      console.log(err)
      res.status(400).json({
        success: 0,
        error: "Cannot Get Tags"
      })
    } else {
      for (let i = 0; i < results.length; i++) {
        if (results[i].category === "weather") {
          tagWeather.push(results[i])
        }
        if (results[i].category === "Hotels") {
          tagHotels.push(results[i])
        }
        if (results[i].category === "terrain") {
          tagLocations.push(results[i])
        }
        if (results[i].category === "trip duration") {
          tagTrips.push(results[i])
        }
      }
      res.status(200).json({
        tagHotels,
        tagWeather,
        tagLocations,
        tagTrips,
        success: true,
        message: 'data found',
      });
    }
  })
})

router.get("/showRecommendedTrips", passport.authenticate('jwt', { session: false }), async (req, res) => {
  let trips = await Trips.find({});
  trips = trips.filter(T => (Array.isArray(T.tags) && T.userid.toString() !== req.user_id));
  console.log(req.user.tags);
  trips = trips.map(T => {
    T = T.toJSON();
    let hits = T.tags.reduce((current, TR) => {
      let find = req.user.tags.find(T => T.toString() == TR.toString());
      if (find) return (current + 1);
      return current;
    }, 0)
    return {
      ...T,
      hits
    }
  });

  trips.sort((TA, TB) => TB.hits - TA.hits);
  res.json({
    trips: trips
  });
});

module.exports = router;
