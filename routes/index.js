var express = require('express');
var router = express.Router();
const Tag = require('../models/tag');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Sample Index');
});
router.post('/tag', async (req, res) => {
  const tag = await Tag.create({
    name: req.body.name,
    category: req.body.category,
  });
  res.json({
    tag
  });
})

module.exports = router;
