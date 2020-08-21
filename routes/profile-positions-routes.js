'use strict';

var express = require('express');
var router = express.Router();
var profilePositionsController = require("../controllers").profilePositionsController;

router.get('/calculatingOpenTrade', [
    profilePositionsController.calculatingOpenTrade
  ]);
  
  router.get('/calculatingHistoryTrade', [
    profilePositionsController.calculatingHistoryTrade
  ]);

  router.get('/calculatingCommission', [
    profilePositionsController.calculatingCommission
  ]);

  module.exports = router;