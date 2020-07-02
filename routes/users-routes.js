'use strict';

var express = require('express');
var router = express.Router();
var usersController = require('../controllers').usersController;

router.post('/addUser', [
    usersController.addUser
]);

router.get('/allAccounts', [
    usersController.fetchAllAccounts
]);


module.exports = router;
