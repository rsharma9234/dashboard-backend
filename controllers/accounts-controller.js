"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../models');
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const symbolModel = models.symbol;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order;
const filteredProfileModel = models.filtered_profile;
const CustomSwapModel = models.custom_swap;

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

const fetchAllSymbolByAccount = async (req, res, next) => {
    try{
        const {account_id} = req.params;

        let rows = await historyOrderModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('symbol')), 'symbol']],
            where:{ account_id: account_id}
        });

        if(rows && rows.length>0){
            let allSymbols = rows.filter(data => data.symbol!='').map(data => data.symbol);
            return res.status(200).json({rows: allSymbols});
        }

        return res.status(200).json({rows});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolOpenBkp = async (req, res, next) => {
    try{
        const {symbol} = req.body;
        let openOrderInfo = await openOrderModel.findAll({
            where:{ symbol: symbol},
            include:[{
                attributes: ['login', 'id', 'alias'],
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

const fetchAllAccountsBySymbolHistoryBkp  = async (req, res, next) => {
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
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where:{ account_id: data.account_id, symbol: symbol},
                    include:[{
                        attributes: ['login', 'id', 'alias'],
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
            return res.status(200).json({ rows: historyNewOrderInfo});
        }
        return res.status(200).json({ rows: []});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllAccountsBySymbolOpen = async (req, res, next) => {
    try{
        const {startdateFrom, enddateFrom, startdateTo, enddateTo, to_account_id, from_account_id, symbol} = req.body;
          
        let openOrderInfo = await openOrderModel.findAll({
            where:{ symbol: symbol},
            include:[{
                attributes: ['login', 'id', 'alias'],
                model:accountModel
            }]
        });

        let fromOpenOrderInfo = await openOrderModel.findAll({
            where:{ 
                symbol: symbol,
                account_id:from_account_id,
                open_time: {
                    [Op.gte]: startdateFrom,
                    [Op.lt]: enddateFrom,
                }
            },
            include:[{
                attributes: ['login', 'id', 'alias'],
                model:accountModel
            }]
        });
        let toOpenOrderInfo = await openOrderModel.findAll({
            where:{ 
                symbol: symbol,
                account_id:to_account_id,
                open_time: {
                    [Op.gte]: startdateTo,
                    [Op.lt]: enddateTo,
                }
            },
            include:[{
                attributes: ['login', 'id', 'alias'],
                model:accountModel
            }]
        });
        
        if(openOrderInfo && openOrderInfo.length>0){
            openOrderInfo.map(data => data.toJSON());
            fromOpenOrderInfo.map(data => data.toJSON());
            toOpenOrderInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: openOrderInfo, fromOpenOrderInfo, toOpenOrderInfo});
        }
        return res.status(200).json({ rows: [], fromOpenOrderInfo:[], toOpenOrderInfo:[]});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolHistory = async (req, res, next) => {
    try{
        // const {symbol} = req.body;
        const {startdateFrom, enddateFrom, startdateTo, enddateTo, to_account_id, from_account_id, symbol} = req.body;


        // let uniqueAccounts = await historyOrderModel.findAll({
        //     attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('account_id')), 'account_id']],
        //     where:{ symbol: symbol}
        // });

        // let historyNewOrderInfo=[];
        // if(uniqueAccounts && uniqueAccounts.length>0){
        //     historyNewOrderInfo = await Promise.all(uniqueAccounts.map(async(data) => {
        //         let historyOrderInfos = await historyOrderModel.findAll({
        //             attributes: [
        //                 [Sequelize.literal('SUM(swap)'), 'swap'], 
        //                 [Sequelize.literal('SUM(taxes)'), 'taxes'],
        //                 [Sequelize.literal('SUM(commission)'), 'commission'],
        //                 [Sequelize.literal('SUM(lots)'), 'lots'],
        //                 [Sequelize.literal('SUM(profit)'), 'profit'],
        //                 [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
        //             ],
        //             where:{ account_id: data.account_id, symbol: symbol},
        //             include:[{
        //                 attributes: ['login', 'id', 'alias'],
        //                 model:accountModel
        //             }]
        //         });
        //         if(historyOrderInfos && historyOrderInfos.length>0){
        //             historyOrderInfos.map(nt=> nt.toJSON());
        //             return historyOrderInfos[0];
        //         }
        //         return [];
        //     }));
        // }

        let fromHistoryOrderInfo = await historyOrderModel.findAll({
            attributes: [
                [Sequelize.literal('SUM(swap)'), 'swap'], 
                [Sequelize.literal('SUM(taxes)'), 'taxes'],
                [Sequelize.literal('SUM(commission)'), 'commission'],
                [Sequelize.literal('SUM(lots)'), 'lots'],
                [Sequelize.literal('SUM(profit)'), 'profit'],
                [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
            ],
            where:{ 
                account_id:from_account_id,
                symbol: symbol,
                open_time: {
                    [Op.gte]: startdateFrom,
                },
                close_time: {
                    [Op.lt]: enddateFrom,
                }
            },
            include:[{
                attributes: ['login', 'id', 'alias'],
                model:accountModel
            }]
        });
        let toHistoryOrderInfo = await historyOrderModel.findAll({
            attributes: [
                [Sequelize.literal('SUM(swap)'), 'swap'], 
                [Sequelize.literal('SUM(taxes)'), 'taxes'],
                [Sequelize.literal('SUM(commission)'), 'commission'],
                [Sequelize.literal('SUM(lots)'), 'lots'],
                [Sequelize.literal('SUM(profit)'), 'profit'],
                [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
            ],
            where:{ 
                account_id:to_account_id,
                symbol: symbol,
                open_time: {
                    [Op.gte]: startdateTo,
                },
                close_time: {
                    [Op.lt]: enddateTo,
                }
            },
            include:[{
                attributes: ['login', 'id', 'alias'],
                model:accountModel
            }]
        });

        // if(historyNewOrderInfo && historyNewOrderInfo.length>0){
        let rows = [];
        if(fromHistoryOrderInfo.length>0 || toHistoryOrderInfo.length>0){
            (fromHistoryOrderInfo.length>0) && fromHistoryOrderInfo.map(data => data.toJSON());
            (toHistoryOrderInfo.length>0) && toHistoryOrderInfo.map(data => data.toJSON());

                // rows.push(fromHistoryOrderInfo[0])
                // rows.push(toHistoryOrderInfo[0])
            

            // return res.status(200).json({ rows: historyNewOrderInfo});
            return res.status(200).json({ rows: rows, fromHistoryOrderInfo:fromHistoryOrderInfo, toHistoryOrderInfo:toHistoryOrderInfo});
        }
        return res.status(200).json({ rows: [], toHistoryOrderInfo:[],fromHistoryOrderInfo:[]});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllOpenTradebkp = async (req, res, next) => {
    try{
        let filteredInfo = await filteredProfileModel.findOne({
            where:{ status: 1},
            raw:true
        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include:[accountsDetailModel]
        });
        
        if(filteredInfo!=null){
            let openOrderFromInfo=[];
            let openOrderToInfo=[];
            let fromAccountId= filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            let enddateFrom = filteredInfo.enddateFrom;
            
            
            let toAccountId= filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            let enddateTo = filteredInfo.enddateTo;

            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;


            let combineSymbols = fromsymbols.concat(tosymbols);
            let uniqueSymbols = combineSymbols.filter((item, i, ar) => ar.indexOf(item) === i);

            if(fromsymbols && fromsymbols.length>0){
                openOrderFromInfo = await Promise.all(fromsymbols.map(async(symbol) => {
                    let openOrderInfos = await openOrderModel.findAll({
                        where:{ account_id: fromAccountId, symbol: symbol,
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }}
                    });
                    if(openOrderInfos && openOrderInfos.length>0){
                        openOrderInfos.map(nt=> nt.toJSON());
                        return openOrderInfos[0];
                    }
                    // return [];
                }));
            }
            if(tosymbols && tosymbols.length>0){
                openOrderToInfo = await Promise.all(tosymbols.map(async(symbol) => {
                    let openOrderInfos = await openOrderModel.findAll({
                        where:{ account_id: toAccountId, symbol: symbol,
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }}
                    });
                    if(openOrderInfos && openOrderInfos.length>0){
                        openOrderInfos.map(nt=> nt.toJSON());
                        return openOrderInfos[0];
                    }
                }));
            }
            let showArr = []
            let showArrs = []
            Promise.all([uniqueSymbols.forEach((symbol) => {
                let emptyArr={};
                let emptyArrs={};
                // showArr[symbol] = [];
                let fromInfo = openOrderFromInfo.find(data => data!=null && data.symbol === symbol)
                let toInfo = openOrderToInfo.find(data => data!=null && data.symbol === symbol)
                let firstCondition = false;

                if(fromInfo!=undefined && toInfo!=undefined){
                    firstCondition=true;
                    let arr = [];
                    let data = {
                        fromInfo,
                        toInfo
                    }
                    arr.push(data)
                    // emptyArrs[symbol] = [data]
                    emptyArrs[symbol] = [{ fromInfo, toInfo}]
                    showArrs.push(emptyArrs);
                }
                // if(fromInfo && fromInfo.length>0){
                if(fromInfo!=undefined && !firstCondition){
                    // console.log('isnside fromInfo')
                    // (showArr[symbol]).push(fromInfo);
                    // (showArr[symbol]) = (fromInfo);
                    // let arr = []
                    // arr.push(fromInfo)
                    // console.log(arr, 'arr')
                    // // emptyArr[symbol] = (fromInfo)
                    // emptyArr[symbol] = arr
                    // // (emptyArr[symbol]).push(fromInfo)
                    // firstCondition = true;
                    
                    // // emptyArr[symbol] = fromInfo
                    // showArrs.push(emptyArr);
                    emptyArrs[symbol] = [{"fromInfo":fromInfo}]
                    showArrs.push(emptyArrs);

                    // (showArr).push(fromInfo);
                }
                if(toInfo!=undefined && !firstCondition){
                    // console.log('isnside fromInfo')
                    // (showArr[symbol]).push(fromInfo);
                    // (showArr[symbol]) = (fromInfo);
                    // emptyArrs[symbol] = [data]
                    emptyArrs[symbol] = [{"toInfo":toInfo}]
                    showArrs.push(emptyArrs);
                    
                    // arr.push({toInfo:toInfo})
                    // console.log(arr, 'arr')
                    // // emptyArr[symbol] = (fromInfo)
                    // emptyArr[symbol] = arr
                    // // (emptyArr[symbol]).push(fromInfo)
                    // // emptyArr[symbol] = fromInfo
                    // showArrs.push(emptyArr);

                    // (showArr).push(fromInfo);
                }
                // // if(toInfo && toInfo.length>0){
                    // if(toInfo!=undefined){
                    
                //     // console.log('isnside toInfo')
                //     // (emptyArr[symbol]).push(toInfo[0]);
                //     // emptyArr[symbol] = fromInfo
           
                return showArr
            })]);
  
  
            // openOrderInfo.map(data => data.toJSON());
            return res.status(200).json({ 
                // rows: filteredInfo, openOrderFromInfo:openOrderFromInfo,openOrderToInfo:openOrderToInfo, 
                showArr:showArr,
                showArrs
            });
        }
        return res.status(200).json({ rows: []});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllOpenTrade = async (req, res, next) => {
    try{
        let filteredInfo = await filteredProfileModel.findOne({
            where:{ status: 1},
            raw:true
        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include:[accountsDetailModel]
        });
        let swapInfo = await CustomSwapModel.findAll({raw:true});
        if(filteredInfo!=null){
            let openOrderFromInfo=[];
            let openOrderToInfo=[];
            let fromAccountId= filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            // let enddateFrom = filteredInfo.enddateFrom;
            let enddateFrom = (filteredInfo.enddateFrom==null || filteredInfo.enddateFrom=='') ? new Date() : filteredInfo.enddateFrom;
            
            let toAccountId= filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            // let enddateTo = filteredInfo.enddateTo;
            let enddateTo = (filteredInfo.enddateTo==null || filteredInfo.enddateTo=='') ? new Date() : filteredInfo.enddateTo;


            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);

            let newFromSwapRecord = swapInfo.filter(rec => rec.account_id == fromAccountId);
            let newToSwapRecord = swapInfo.filter(rec => rec.account_id == toAccountId);

            
            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;
            
            filteredInfo.swapFrominfo = newFromSwapRecord;
            filteredInfo.swapToinfo = newToSwapRecord;

            // let combineSymbols = fromsymbols.concat(tosymbols);
            // let uniqueSymbols = combineSymbols.filter((item, i, ar) => ar.indexOf(item) === i);

            if(fromsymbols && fromsymbols.length>0){
                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+swap)'), 'total']
                    ],
                    where:{ account_id: fromAccountId, 
                        symbol:  {
                            [Op.in]: fromsymbols
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }}
                });
                if(openOrderInfos && openOrderInfos.length>0){
                    openOrderInfos.map(nt=> nt.toJSON());
                    openOrderFromInfo= openOrderInfos;
                }
            }
            if(tosymbols && tosymbols.length>0){
                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+swap)'), 'total']
                    ],
                    where:{ account_id: toAccountId, 
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }}
                });

                if(openOrderInfos && openOrderInfos.length>0){
                    openOrderToInfo = openOrderInfos;
                }
            }
            return res.status(200).json({ 
                rows: filteredInfo, 
                fromOpenOrderInfo:openOrderFromInfo,
                toOpenOrderInfo:openOrderToInfo,
            });
        }
        return res.status(200).json({ rows: [], fromOpenOrderInfo:[], toOpenOrderInfo:[]});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllHistoryTrade = async (req, res, next) => {
    try{
        let filteredInfo = await filteredProfileModel.findOne({
            where:{ status: 1},
            raw:true
        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include:[accountsDetailModel]
        });

        if(filteredInfo!=null){
            let openOrderFromInfo=[];
            let openOrderToInfo=[];
            let fromAccountId= filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            // let enddateFrom = filteredInfo.enddateFrom;
            let enddateFrom = (filteredInfo.enddateFrom==null || filteredInfo.enddateFrom=='') ? new Date() : filteredInfo.enddateFrom;
            
            
            let toAccountId= filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            // let enddateTo = filteredInfo.enddateTo;
            let enddateTo = (filteredInfo.enddateTo==null || filteredInfo.enddateTo=='') ? new Date() : filteredInfo.enddateTo;


            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;

            if(fromsymbols && fromsymbols.length>0){
                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where:{ account_id: fromAccountId, 
                        symbol:  {
                            [Op.in]: fromsymbols
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }}
                });
                if(openOrderInfos && openOrderInfos.length>0){
                    openOrderInfos.map(nt=> nt.toJSON());
                    openOrderFromInfo= openOrderInfos;
                }
            }
            if(tosymbols && tosymbols.length>0){
                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'], 
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    
                    where:{ account_id: toAccountId, 
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }}
                });

                if(openOrderInfos && openOrderInfos.length>0){
                    openOrderToInfo = openOrderInfos;
                }
            }
            return res.status(200).json({ 
                rows: filteredInfo, 
                fromHistoryOrderInfo:openOrderFromInfo,
                toHistoryOrderInfo:openOrderToInfo,
            });
        }
        return res.status(200).json({ rows: [], fromHistoryOrderInfo:[], toHistoryOrderInfo:[]});
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

module.exports = {
    fetchAllAccounts, 
    fetchAllSymbol,
    fetchAllAccountsBySymbolOpen,
    fetchAllAccountsBySymbolHistory,
    fetchAllOpenTrade,
    fetchAllHistoryTrade,
    fetchAllSymbolByAccount
};
