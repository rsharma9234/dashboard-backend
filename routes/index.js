var express = require('express');
var router = express.Router();
const accountRoute = require('./account-routes');
const usersRoute = require('./users-routes');
const filterRoute = require('./filter-routes');
const whatAmCalculating = require('./what-am-calculating-routes');

router.use('/accounts', accountRoute);
router.use('/users', usersRoute);
router.use('/filter', filterRoute);
router.use('/whatamcalculating', whatAmCalculating);


module.exports = router;
