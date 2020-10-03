'use strict';

var express = require('express');
var router = express.Router();
var filterController = require('../controllers').filterController;
var authMiddleware = require('../middleware/auth')


router.post('/addfilterdata', [
  filterController.addFilterData
]);

router.get('/fetchfilterdata', authMiddleware.authJwt, [
  filterController.fetchFilterData
]);

router.get('/fetchActivefilterdata', authMiddleware.authJwt, [
  filterController.fetchActivefilterdata
]);

router.post('/updatefilterdata', authMiddleware.authJwt,[
  filterController.updateFilterData
]);
router.post('/deletefilter', [
  filterController.deleteFilter
]);
router.post('/updatefilterdatafull', [
  filterController.updateFilterDataFull
]);
router.get('/fetchdailyswaps', [
  filterController.fetchDailySwaps
]);



module.exports = router;