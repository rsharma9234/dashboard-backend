"use strict";

const models = require("../models");
const accountModel = models.account;
const mainLoginModel = models.main_login;
const userModel = models.users;

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
    let { username, password } = req.body;
    let accountCheck = await mainLoginModel.findOne({
      where: { username },
      raw: true,
    });
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
    return res.status(200).json({ rows: accountInfo });
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
    console.log(req.body.username, req.body.password, "req");
    console.log(userOneInfo);
    if (userOneInfo.length >0) {
      if (userOneInfo[0].username === req.body.username) {
        console.log(userOneInfo[0].username);
        return res
          .status(200)
          .json({ message: "User already exists", status: "500" });
      }
    } else {
      userModel.create({
        username: req.body.username,
        password: req.body.password,
      });
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
      console.log(data,'000000');
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


const userLogin = async (req, res, next) => {
  try {
    let { username, password, logged_in } = req.body;
    let userCheck = await userModel.findOne({
      where: { username },
      raw: true,
    });
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
    await userModel.update({ logged_in: logged_in }, { where: { username } });
    let userInfo = await userModel.findAll({
      attributes: { exclude: ["password"] },
      where: { username, password },
      raw: true,
    });
    return res.status(200).json({ rows: userInfo });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
const userUpdate = async (req, res, next) => {
  try {
    console.log(req.body);
    let {id, username}  = req.body;
    let userInfo = await userModel.findOne({
      where: {
        id
      },
      raw: true
    });
    if (userInfo) {
      await userModel.update({username: username},{ where: { id } });
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

module.exports = {
  fetchAllAccounts,
  addUser,
  mainLogin,
  updateUser,
  checkUserConnected,
  userCreate,
  allusers,
  userLogin,
  userUpdate,
  userDelete
};
