var express = require('express');
var router = express.Router();
var path = require('path');
const TopPlaces = require('../models/topDestinations');
var User = require('../models/user');
var authenticate = require('../authenticate');
const cors = require('./cors');
const multer = require('multer');
const users = require('../models/user');
const transport = require('../models/transport');
const contactus = require('../models/contactus');
const guide = require('../models/guide');
const trips = require('../models/trips');
const business = require('../models/business');
const vehicles = require('../models/vehicles');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const filefilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    console.log('Only JPEG or PNG Images Supported');
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
});

//addnewtopplaces
router.post(
  '/addplaces',
  cors.cors,
  upload.array('image', 6),
  (req, res, next) => {
    var paths = [];
    for (var i = 0; i < req.files.length; i++) {
      paths[i] = 'http://localhost:3000/uploads/' + req.files[i].filename;
    }
    console.log('paths is ' + paths);
    const place = new TopPlaces({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description,
      image: paths,
    });
    place
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'Place Created Successfully',
          createdPlace: {
            name: result.name,
            location: result.location,
            description: result.description,
            image: result.image,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

//edittopplaces
router.put(
  '/updateTopPlace/:id',
  upload.array('image', 6),
  (req, res, next) => {
    var paths = [];
    console.log(req.files);
    for (var i = 0; i < req.files.length; i++) {
      paths[i] = 'http://localhost:3000/uploads/' + req.files[i].filename;
    }
    TopPlaces.findOneAndUpdate(
      { _id: req.params.id },
      {
        name: req.body.name,
        location: req.body.location,
        description: req.body.description,
        image: paths,
      }
    )
      .then((data) => {
        res.json({
          success: true,
          data: data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);

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

//view list of all users
router.get('/viewusers', function (req, res) {
  User.find({}, function (err, data) {
    if (err) console.log(err);
    else {
      res.json(data);
    }
  });
});

//view all transports
router.get('/viewtransport', function (req, res) {
  transport.find({}, function (err, data) {
    if (err) console.log(err);
    else {
      res.json(data);
    }
  });
});

//deletetopplace
router.delete('/deleteTopPlace/:id', function (req, res) {
  TopPlaces.remove(
    {
      _id: req.params.id,
    },
    function (err, place) {
      if (err) {
        return console.error(err);
      }

      console.log('Top Place successfully removed from collection!' + place);
      res.status(200).send();
    }
  );
});

//delete user
router.delete('/deleteuser/:id', function (req, res) {
  User.remove(
    {
      _id: req.params.id,
    },
    function (err, user) {
      if (err) {
        return console.error(err);
      }
      console.log('User successfully removed from polls collection!');
      res.status(200).send();
    }
  );
});

//delete transport details of a user
router.delete('/deletetransport/:id', function (req, res) {
  transport.remove(
    {
      userid: req.params.id,
    },
    function (err, user) {
      if (err) {
        return console.error(err);
      }
      console.log('User successfully removed from polls collection!');
      res.status(200).send();
    }
  );
});

//approve transport detail of user
router.post('/approvetransport', function (req, res) {
  transport.update(
    {
      userid: req.body.userid,
    },
    {
      approved: true,
    },
    function (err, user) {
      if (err) {
        return console.error(err);
      }
      console.log('User is sucessfully approved, regards!');
      res.status(200).send();
    }
  );
});

//usercontactuslist
router.route('/viewcontactus').get((req, res) => {
  contactus.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});
//usercontactlistdelete
router.route('/deletecontactus/:id').delete((req, res, next) => {
  contactus.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

//guide routes are stated as

router.route('/deleteGuide/:id').delete((req, res, next) => {
  guide.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

router
  .route('/approveGuide/:id', { useFindAndModify: false })
  .post((req, res, next) => {
    guide.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            msg: data,
          });
        }
      }
    );
  });
router.route('/viewguiderequests').get((req, res, next) => {
  var query = { approved: false };
  guide.find(query, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      res.json(data);
    }
  });
});
router.route('/viewApprovedGuides').get((req, res, next) => {
  var query = { approved: true };
  guide.find(query, function (err, data) {
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
    if (err) console.log(err);
    else {
      res.json(data);
      // console.log(data);
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
        'vehicles.$.color': req.body.color,
        'vehicles.$.image': req.body.image,
        'vehicles.$.modelyear': req.body.modelyear,
        'vehicles.$.vehiclereg': req.body.vehiclereg,
        'vehicles.$.price': req.body.price,
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
router.get('/viewtransport', function (req, res) {
  transport.find({}, function (err, data) {
    if (err) console.log(err);
    else {
      res.json(data);
    }
  });
});
//search transport across the country
router.get('/searchtransport', function (req, res) {
  console.log('id: ' + req.body.city);
  transport.find({ city: req.body.city }, function (err, data) {
    if (err) console.log(err);
    else {
      console.log('Data is ' + data);
      res.json(data);
    }
  });
});

//delete transport details of a user
router.delete('/deletetransport/:id', function (req, res) {
  transport.remove(
    {
      userid: req.params.id,
    },
    function (err, user) {
      if (err) {
        return console.error(err);
      }
      console.log('User successfully removed from polls collection!');
      res.status(200).send();
    }
  );
});

//approve transport detail of user
router.put('/approvetransport', function (req, res) {
  transport.update(
    {
      userid: req.body.userid,
    },
    {
      approved: true,
    },
    function (err, user) {
      if (err) {
        console.error(err);
        res.status(400).json({
          error: 'Failed upadting status',
        });
      }
      console.log('User is sucessfully approved, regards!');
      res.status(200).json({
        message: 'stauts changed',
      });
    }
  );
});
//Disapprove transport detail of user
router.put('/disapprovetransport', function (req, res) {
  transport.update(
    {
      userid: req.body.userid,
    },
    {
      approved: false,
    },
    function (err, user) {
      if (err) {
        console.error(err);
        res.status(400).json({
          error: 'Failed upadting status',
        });
      }
      console.log('User is sucessfully Disapproved!');
      res.status(200).json({
        message: 'stauts changed',
      });
    }
  );
});
router.post('/addTransport', (req, res) => {
  console.log(req.body);
  var myData = new Vehicles(req.body);
  myData
    .save()
    .then((item) => {
      res.send('item saved to database');
    })
    .catch((err) => {
      res.status(400).send('unable to save to database');
    });
});

router.get('/totalRecords', async (req, res) => {
  try {
    let serviceProvider = await business.find({});
    let guides = await guide.find({});
    let transports = await transport.find({});
    let trip = await trips.find({});
    let user = await users.find({});
    let vehicle = await vehicles.find({});
    // console.log(transports);
    let spcount = serviceProvider.length;
    let guidescount = guides.length;
    let transportcount = transports.length;
    let tripscount = trip.length;
    let usercount = user.length;
    let vehiclecount = vehicle.length;
    let countUnapprovedTransport = 0;
    let countAvailableTransport = 0;
    let TotolTransports = 0;
    let countUnapprovedGuides = 0;
    let countAvailableGuides = 0;
    let totalusers = 0;
    var slicedData = [];
    var userData = [];
    for (let i = 0; i < user.length; i++) {
      if (!user[i].admin === true) {
        slicedData.push(user[i].created_at.toString().slice(4, 15));
      }
    }
    console.log(slicedData);
    for (let i = 0; i < slicedData.length; i++) {
      totalusers++;
      if (i === 0) {
        userData.push({
          month: slicedData[i].slice(0, 3),
          count: 1,
        });
        continue;
      }
      for (let j = 0; j < userData.length; j++) {
        if (slicedData[i].slice(0, 3) === userData[j].month) {
          userData[j].count += 1;
          break;
        }
        if (j === userData.length - 1) {
          userData.push({
            month: slicedData[i].slice(0, 3),
            count: 1,
          });
          break;
        }
      }
    }
    console.log(totalusers);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const sorter = (a, b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    };
    userData.sort(sorter);
    console.log(userData);

    for (let i = 0; i < guides.length; i++) {
      if (guides[i].availability === true && guides[i].approved === true) {
        countAvailableGuides = countAvailableGuides + 1;
      }
      countAvailableGuides = countAvailableGuides + 0;
      if (guides[i].approved === false) {
        countUnapprovedGuides = countUnapprovedGuides + 1;
      }
      countUnapprovedGuides = countUnapprovedGuides + 0;
    }

    for (let i = 0; i < transports.length; i++) {
      for (let j = 0; j < transports[i].vehicles.length; j++) {
        TotolTransports = TotolTransports + j;
        if (
          transports[i].approved === true &&
          transports[i].vehicles[j].available === true
        ) {
          countAvailableTransport = countAvailableTransport + 1;
        }
        countAvailableTransport = countAvailableTransport + 0;

        if (transports[i].approved === false) {
          countUnapprovedTransport = countUnapprovedTransport + 1;
        }
        countUnapprovedTransport = countUnapprovedTransport + 0;
      }
    }
    res.status(200).json({
      guidesData: [
        { title: 'Available Guides', value: countAvailableGuides },
        {
          title: 'Unavailable Guides',
          value: guidescount - countAvailableGuides - countUnapprovedGuides,
        },
        {
          title: 'Approved Guides',
          value: guidescount - countUnapprovedGuides,
        },
        {
          title: 'Non Approved Guides',
          value: countUnapprovedGuides,
        },
      ],
      transportData: [
        { title: 'Available Transport', value: countAvailableTransport },
        {
          title: 'Unavailable Transport',
          value:
            TotolTransports -
            countAvailableTransport -
            countUnapprovedTransport,
        },
        {
          title: 'Approved Transport',
          value: TotolTransports - countUnapprovedTransport,
        },
        {
          title: 'Non Approved Transport',
          value: countUnapprovedTransport,
        },
      ],
      totalSum: [
        { title: 'Total transport', value: TotolTransports },
        { title: 'Total Guides', value: guidescount },
        { title: 'Total Service Provider', value: spcount },
        { title: 'Total Trips', value: tripscount },
        { title: 'Total Users', value: totalusers },
        // { title: 'Total Vehicle', value: vehiclecount },
      ],
      userData,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
