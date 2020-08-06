'use strict';

var express = require('express');
var router = express.Router();
var whatAmCalculatingController = require("../controllers").whatAmCalculatingController;

router.get('/calculatingOpenTrade', [
    whatAmCalculatingController.calculatingOpenTrade
  ]);
  
  router.get('/calculatingHistoryTrade', [
    whatAmCalculatingController.calculatingHistoryTrade
  ]);

  module.exports = router;