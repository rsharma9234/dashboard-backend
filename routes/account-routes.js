'use strict';

var express = require('express');
var router = express.Router();
var accountsController = require('../controllers').accountsController;
var authMiddleware = require('../middleware/auth')

router.get('/fetchAllAccounts', [
    accountsController.fetchAllAccounts
]);

router.get('/fetchAllSymbol', [
    accountsController.fetchAllSymbol
]);

router.get('/fetchAllOpenTrade', authMiddleware.authJwt, [
  accountsController.fetchAllOpenTrade
]);

router.get('/fetchAllHistoryTrade', authMiddleware.authJwt, [
  accountsController.fetchAllHistoryTrade
])

router.get('/fetchLastUpdatedTime', authMiddleware.authJwt,[
  accountsController.fetchLastUpdatedTime
])

router.get('/fetchStatusData', authMiddleware.authJwt,[
  accountsController.fetchStatusData
])

module.exports = router;
