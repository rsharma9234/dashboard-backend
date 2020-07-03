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

router.post('/fetchAllBySymbolOpen', [
    accountsController.fetchAllAccountsBySymbolOpen
]);

router.post('/fetchAllBySymbolHistory', [
    accountsController.fetchAllAccountsBySymbolHistory
]);


module.exports = router;
