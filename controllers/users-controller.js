"use strict";

const models = require('../models');
const accountModel = models.account;
const mainLoginModel = models.main_login;

const fetchAllAccounts = async (req, res, next) => {
    try{
        let accountInfo = await accountModel.findAll({
            attributes: { exclude: ['password'] },
            where:{ status:1},
            raw:true
        });
        return res.status(200).json({ rows: accountInfo});

    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const addUser = async (req, res, next) => {
    try{
        let {login, password, broker, alias} = req.body;
        let accountOneInfo = await accountModel.findOne({
            where:{
                login, password, broker
            }
        });
        if(accountOneInfo){
           await accountModel.update({status:1}, { where:{ login }});
        }
        let accountInfo = await accountModel.findAll({
            attributes: { exclude: ['password'] },
            where:{ status:1}, raw:true
        });
        return res.status(200).json({ rows: accountInfo});
    
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}


const mainLogin = async (req, res, next) => {
    try{
        let { username, password} = req.body;
        let accountInfo = await mainLoginModel.findAll({
            attributes: { exclude: ['password'] },
            where:{ username, password},
            raw:true
        });
        return res.status(200).json({ rows: accountInfo});

    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

module.exports = {
    fetchAllAccounts, addUser, mainLogin
};
