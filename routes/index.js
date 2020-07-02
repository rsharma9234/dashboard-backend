var express = require('express');
var router = express.Router();
const accountRoute = require('./account-routes');
const usersRoute = require('./users-routes');

router.use('/accounts', accountRoute);
router.use('/users', usersRoute);


module.exports = router;
