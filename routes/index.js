var express = require('express');
var router = express.Router();
const accountRoute = require('./account-routes');
const usersRoute = require('./users-routes');
const filterRoute = require('./filter-routes');
const profilePositionsRoute = require('./profile-positions-routes');

router.use('/accounts', accountRoute);
router.use('/users', usersRoute);
router.use('/filter', filterRoute);
router.use('/profilepositions', profilePositionsRoute);


module.exports = router;
