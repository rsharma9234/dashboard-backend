const jwt = require("jsonwebtoken");
const config = require("../config/token");


exports.authJwt = (req, res, next) => {
    console.log(req.headers, 'token');
  const token = JSON.parse(req.headers["x-access-token"]);
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    // console.log(req);
    req.userId = decoded.id;
    next();
  });
};