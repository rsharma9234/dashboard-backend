"use strict";

const models = require('../models');
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const symbolModel = models.symbol;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order;
const Sequelize = require("sequelize");

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

const fetchAllSymbol = async (req, res, next) => {
    try{
        let symbolInfo = await symbolModel.findAll({raw:true});
        return res.status(200).json({ rows: symbolInfo});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolOpen = async (req, res, next) => {
    try{
        const {symbol} = req.body;
        let openOrderInfo = await openOrderModel.findAll({
            where:{ symbol: symbol},
            include:[{
                attributes:['login'],
                model:accountModel
            }]
        });
        
        if(openOrderInfo && openOrderInfo.length>0){
            openOrderInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: openOrderInfo});
        }
        return res.status(200).json({ rows: []});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolHistory = async (req, res, next) => {
    try{
        const {symbol} = req.body;

        let uniqueAccounts = await historyOrderModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('account_id')), 'account_id']],
            where:{ symbol: symbol}
        });

        let historyNewOrderInfo=[];
        if(uniqueAccounts && uniqueAccounts.length>0){
            historyNewOrderInfo = await Promise.all(uniqueAccounts.map(async(data) => {
                let historyOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        'account_id', 
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where:{ account_id: data.account_id, symbol: symbol},
                    include:[{
                        attributes: ['login'],
                        model:accountModel
                    }]
                });
                if(historyOrderInfos && historyOrderInfos.length>0){
                    historyOrderInfos.map(nt=> nt.toJSON());
                    return historyOrderInfos[0];
                }
                return [];
            }));
        }

        // let historyOrderInfo = await historyOrderModel.findAll({
        //     where:{ symbol: symbol},
        //     include:[{
        //         attributes: { exclude: ['password'] },
        //         model:accountModel
        //     }]
        // });
        
        // if(historyOrderInfo && historyOrderInfo.length>0){
            // historyOrderInfo.map(data => data.toJSON());
            // return res.status(200).json({ rows: historyOrderInfo, data:historyNewOrderInfo, uniqueAccounts});
        if(historyNewOrderInfo && historyNewOrderInfo.length>0){
            return res.status(200).json({ rows: historyNewOrderInfo,});
        }
        return res.status(200).json({ rows: []});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

module.exports = {
    fetchAllAccounts, 
    fetchAllSymbol,
    fetchAllAccountsBySymbolOpen,
    fetchAllAccountsBySymbolHistory
};
