'use strict';

var express = require('express');
var router = express.Router();
var filterController = require('../controllers').filterController;


router.post('/addfilterdata', [
  filterController.addFilterData
]);
router.get('/fetchfilterdata', [
  filterController.fetchFilterData
]);

router.post('/updatefilterdata', [
  filterController.updateFilterData
]);



module.exports = router;