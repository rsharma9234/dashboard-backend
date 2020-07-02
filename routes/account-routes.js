'use strict';

var express = require('express');
var router = express.Router();
var accountsController = require('../controllers').accountsController;

router.get('/fetchAllAccounts', [
    accountsController.fetchAllAccounts
]);


module.exports = router;
