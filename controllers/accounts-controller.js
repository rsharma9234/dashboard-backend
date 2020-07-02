"use strict";

const models = require('../models');
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;

const fetchAllAccounts = async (req, res, next) => {
    try{
        let accountInfo = await accountModel.findAll({
            attributes: { exclude: ['password'] },
            include:[accountsDetailModel]
        });
        if(accountInfo && accountInfo.length>0){
            accountInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: accountInfo});
        }
        return res.status(200).json({ rows: []});

    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

module.exports = {
    fetchAllAccounts
};
