'use strict';

var express = require('express');
var router = express.Router();
var accountsController = require('../controllers').accountsController;

router.get('/fetchAllAccounts', [
    accountsController.fetchAllAccounts
]);

router.get('/fetchAllSymbol', [
    accountsController.fetchAllSymbol
]);

router.get('/fetchAllOpenTrade', [
  accountsController.fetchAllOpenTrade
]);

router.get('/fetchAllHistoryTrade', [
  accountsController.fetchAllHistoryTrade
])

router.get('/fetchLastUpdatedTime',[
  accountsController.fetchLastUpdatedTime
])

router.get('/fetchStatusData',[
  accountsController.fetchStatusData
])

module.exports = router;
