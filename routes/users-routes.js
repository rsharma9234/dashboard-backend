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
router.post('/logout', [
    usersController.userLogout
]);
router.post('/update', [
    usersController.userUpdate
]);
router.post('/delete', [
    usersController.userDelete
]);
router.get('/allFilterprofiles', [
    usersController.allFilterprofiles
]);

module.exports = router;
