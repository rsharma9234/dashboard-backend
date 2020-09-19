'use strict';

var express = require('express');
var router = express.Router();
var usersController = require('../controllers').usersController;

router.post('/checkUserConnected', [
    usersController.checkUserConnected
]);

router.post('/addUser', [
    usersController.addUser
]);

router.get('/allAccounts', [
    usersController.fetchAllAccounts
]);

router.post('/mainLogin', [
    usersController.mainLogin
]);

router.post('/updateuser', [
    usersController.updateUser
]);
router.post('/create', [
    usersController.userCreate
]);
router.get('/allusers', [
    usersController.allusers
]);
router.post('/login', [
    usersController.userLogin
]);
router.post('/update', [
    usersController.userUpdate
]);
router.post('/delete', [
    usersController.userDelete
]);


module.exports = router;
