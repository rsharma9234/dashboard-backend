'use strict';

var express = require('express');
var router = express.Router();
var profilePositionsController = require("../controllers").profilePositionsController;
var authMiddleware = require('../middleware/auth')

router.get('/calculatingOpenTrade', authMiddleware.authJwt, [
    profilePositionsController.calculatingOpenTrade
  ]);
  
  router.get('/calculatingHistoryTrade', authMiddleware.authJwt, [
    profilePositionsController.calculatingHistoryTrade
  ]);

  router.get('/calculatingCommission', authMiddleware.authJwt, [
    profilePositionsController.calculatingCommission
  ]);

  module.exports = router;