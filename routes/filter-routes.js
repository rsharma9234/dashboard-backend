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

router.get('/fetchActivefilterdata', [
  filterController.fetchActivefilterdata
]);
// router.get('/updateCustomDeposite/:account_id', [
//   filterController.getData
// ]);

router.post('/updatefilterdata', [
  filterController.updateFilterData
]);
router.post('/deletefilter', [
  filterController.deleteFilter
]);
router.post('/updatefilterdatafull', [
  filterController.updateFilterDataFull
]);



module.exports = router;