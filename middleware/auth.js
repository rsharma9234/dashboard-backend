const jwt = require("jsonwebtoken");
const config = require("../config/token");
const models = require("../models");
const userModel = models.users;

exports.authJwt = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }

  jwt.verify(token, config.secret, async(err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
    // console.log(decoded, "decoded");
    req.userId = decoded.id;
    if(decoded.role === 'user'){
      let userInfo = await userModel.findOne({
        where: {
          id: decoded.id
        },
        raw: true
      })
      req.userdata = userInfo
      // console.log(req.userdata, 'user data');
    }
    next();
  });
};
