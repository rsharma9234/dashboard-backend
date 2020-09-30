"use strict";

const models = require("../models");
const accountModel = models.account;
const mainLoginModel = models.main_login;
const userModel = models.users;
const userFilterModel = models.userFilter;
const filterModel = models.filtered_profile;
const jwt = require("jsonwebtoken");
const config = require("../config/token");

const fetchAllAccounts = async (req, res, next) => {
  let limit = 10; // number of records per page
  let offset = 0;
  await accountModel
    .findAndCountAll()
    .then((data) => {
      let page = req.query.page; // page number
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      accountModel
        .findAll({
          attributes: { exclude: ["password"] },
          limit: limit,
          offset: offset,
          $sort: { id: 1 },
          raw: true,
        })
        .then((accountInfo) => {
          return res.status(200).json({
            rows: accountInfo,
            count: data.count,
            pages: pages,
          });
        });
    })
    .catch(function (error) {
      res.status(500).send("Internal Server Error");
    });
};

const addUser = async (req, res, next) => {
  try {
    let { login, password, broker, alias, is_server } = req.body;
    let accountOneInfo = await accountModel.findOne({
      where: {
        login: login,
      },
      raw: true,
    });

    if (accountOneInfo) {
      // if(accountModel.comparePassword(req.body.password, accountOneInfo.password)){
      //   return res.status(200).json({ message: "already exists", status: "500" });
      // }
      // if(req.body.password === accountOneInfo.password){
      //   return res.status(200).json({ message: "already exists", status: "500" });
      // }
      if (accountOneInfo.status === 0) {
        return res.status(200).json({ status: true });
      }
      return res.status(200).json({ message: "already exists", status: "500" });
    } else {
      accountModel.create({
        login: req.body.login,
        password: req.body.password,
        broker: broker,
        alias: alias,
        status: 0,
        active: 1,
        is_server: is_server,
      });
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const checkUserConnected = async (req, res, next) => {
  try {
    let { login, broker } = req.body;
    let accountOneInfo = await accountModel.findOne({
      attributes: { exclude: ["password"] },
      where: {
        login: login,
        broker: broker,
        launched: 1,
      },
    });
    if (accountOneInfo) {
      await accountModel.update({ status: 1 }, { where: { login, broker } });
      return res.status(200).json({ connected: true });
    } else {
      return res.status(200).json({ connected: false });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const mainLogin = async (req, res, next) => {
  try {
    let { username, password, logged_in } = req.body;
    let accountCheck = await mainLoginModel.findOne({
      where: { username },
      raw: true,
    });
    let userCheck = await userModel.findOne({
      where: { username },
      raw: true,
    });
    if (accountCheck) {
      if (accountCheck === null) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid username.";
        return res.status(200).json(err);
      }
      if (accountCheck.username != username) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid username";
        return res.status(200).json(err);
      }
      if (accountCheck.password !== password) {
        let err = new Error();
        err.status = 404;
        err.name = "password";
        err.message = "Invalid password.";
        return res.status(200).json(err);
      }
      if (accountCheck.username != username) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid password";
        return res.status(200).json(err);
      }
      let accountInfo = await mainLoginModel.findAll({
        attributes: { exclude: ["password"] },
        where: { username, password },
        raw: true,
      });

      var token = jwt.sign(accountInfo[0], config.secret, {
        expiresIn: 86400, // 24 hours
      });
      res.setHeader("x-access-token", token);
      console.log(token, "token");
      return res.status(200).json({ rows: accountInfo, accessToken: token });
    }
    if (userCheck) {
      if (userCheck === null) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid username.";
        return res.status(200).json(err);
      }
      if (userCheck.username != username) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid username";
        return res.status(200).json(err);
      }
      if (userCheck.password !== password) {
        let err = new Error();
        err.status = 404;
        err.name = "password";
        err.message = "Invalid password.";
        return res.status(200).json(err);
      }
      if (userCheck.username != username) {
        let err = new Error();
        err.status = 404;
        err.name = "username";
        err.message = "Invalid password";
        return res.status(200).json(err);
      }
      await userModel.update({ logged_in: 1 }, { where: { username } });
      let userInfo = await userModel.findAll({
        attributes: { exclude: ["password"] },
        where: { username, password },
        raw: true,
      });
      var token = jwt.sign(userInfo[0], config.secret, {
        expiresIn: 86400, // 24 hours
      });
      res.setHeader("x-access-token", token);
      return res.status(200).json({ rows: userInfo, accessToken: token });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const updateUser = async (req, res, next) => {
  try {
    let { id, alias } = req.body;
    let filterInfo = await accountModel.findOne({
      where: {
        id,
      },
    });
    if (filterInfo) {
      await accountModel.update({ alias: alias }, { where: { id } });
      return res.status(200).json({ rows: "Updated" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const userCreate = async (req, res, next) => {
  try {
    let userOneInfo = await userModel.findAll({
      where: {
        username: req.body.username,
      },
      raw: true,
    });
    if (userOneInfo.length > 0) {
      if (userOneInfo[0].username === req.body.username) {
        return res
          .status(200)
          .json({ message: "User already exists", status: "500" });
      }
    } else {
      await userModel.create({
        username: req.body.username,
        password: req.body.password,
        filter_profile: req.body.filter_profile,
      });
      let userforFilter = await userModel.findOne({
        where: { username: req.body.username },
        raw: true,
      });
      console.log(JSON.parse(userforFilter.filter_profile), "userforFilter");
      let f_ids = JSON.parse(userforFilter.filter_profile);
      if (f_ids.length > 0) {
        f_ids.map((item) =>
          userFilterModel.create({
            userId: userforFilter.id,
            filterId: item,
          })
        );
      }
      return res.status(200).json({ status: true });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const allusers = async (req, res, next) => {
  let limit = 10; // number of records per page
  let offset = 0;
  await userModel
    .findAndCountAll()
    .then((data) => {
      let page = req.query.page; // page number
      let pages = Math.ceil(data.count / limit);
      offset = limit * (page - 1);
      userModel
        .findAll({
          attributes: { exclude: ["password"] },
          limit: limit,
          offset: offset,
          $sort: { id: 1 },
          raw: true,
        })
        .then((userInfo) => {
          return res.status(200).json({
            rows: userInfo,
            count: data.count,
            pages: pages,
          });
        });
    })
    .catch(function (error) {
      res.status(500).send("Internal Server Error");
    });
};

const userLogout = async (req, res, next) => {
  try {
    let { id } = req.body;
    await userModel.findOne({
      where: { id },
      raw: true,
    });
    // if (userCheck) {
    await userModel.update({ logged_in: 0 }, { where: { id } });
    return res.status(200).json({ message: "Logged out!" });
    // }
    // return res.status(200).json({ message: "" });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const userUpdate = async (req, res, next) => {
  try {
    console.log(req.body);
    let { id, username, filter_profile } = req.body;
    let userInfo = await userModel.findOne({
      where: {
        id,
      },
      raw: true,
    });
    if (userInfo) {
      await userModel.update(
        { username: username, filter_profile: filter_profile },
        { where: { id } }
      );
      return res.status(200).json({ rows: "Updated" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(console.log(err));
  }
};

const userDelete = async (req, res, next) => {
  try {
    let { id } = req.body;
    let deleteUserInfo = await userModel.findOne({
      where: {
        id,
      },
    });
    if (deleteUserInfo) {
      await userModel.destroy({ where: { id } });
      return res.status(200).json({ rows: "Deleted" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const allFilterprofiles = async (req, res, next) => {
  try {
    // let userdata = await userModel.findAll({
    //   where: { logged_in: 1 },
    //   raw: true,
    // });
    // let userfilter = await userFilterModel.findAll({
    //   where: { userId: userdata[0].id },
    // });

    // let JsonData = JSON.stringify(userfilter);
    // let newdata = JSON.parse(JsonData);
    // let dataall = newdata.map((item) => item.filterId);
    let filterInfo = await filterModel.findAll();

    return res.status(200).json({ rows: filterInfo });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

module.exports = {
  fetchAllAccounts,
  addUser,
  mainLogin,
  updateUser,
  checkUserConnected,
  userCreate,
  allusers,
  userLogout,
  userUpdate,
  userDelete,
  allFilterprofiles,
};
