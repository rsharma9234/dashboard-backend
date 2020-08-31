"use strict";

const models = require("../models");
const accountModel = models.account;
const mainLoginModel = models.main_login;

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
    let { login, password, broker, alias } = req.body;
    let accountOneInfo = await accountModel.findOne({
      where: {
        login: login,
      },
      raw: true,
    });
    // if(accountModel.comparePassword(req.body.password, accountOneInfo.password)){
    //   return true
    // }
    // if(req.body.password === accountOneInfo.password){
    //   return true
    // }
    if (accountOneInfo) {
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

module.exports = {
  fetchAllAccounts,
  addUser,
  mainLogin,
  updateUser,
  checkUserConnected,
};
