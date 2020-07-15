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

router.get('/fetchAllSymbolByAccount/:account_id', [
  accountsController.fetchAllSymbolByAccount
]);

router.post('/fetchAllBySymbolOpen', [
    accountsController.fetchAllAccountsBySymbolOpen
]);

router.post('/fetchAllBySymbolHistory', [
    accountsController.fetchAllAccountsBySymbolHistory
]);

router.get('/fetchAllOpenTrade', [
  accountsController.fetchAllOpenTrade
]);

router.get('/fetchAllHistoryTrade', [
  accountsController.fetchAllHistoryTrade
])


module.exports = router;
