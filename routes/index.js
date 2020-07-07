var express = require('express');
var router = express.Router();
const accountRoute = require('./account-routes');
const usersRoute = require('./users-routes');
const filterRoute = require('./filter-routes');

router.use('/accounts', accountRoute);
router.use('/users', usersRoute);
router.use('/filter', filterRoute);


module.exports = router;
