'use strict';

var express = require('express');
var router = express.Router();
var usersController = require('../controllers').usersController;

router.get('/fetchAllFilterProflie', [
    usersController.fetchAllFilterProflie
]);

router.post('/addFilterProfile', [
    usersController.addFilterProfile
]);

module.exports = router;