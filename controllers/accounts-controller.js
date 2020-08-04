"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../models');
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const symbolModel = models.symbol;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order; ``
const filteredProfileModel = models.filtered_profile;
const CustomSwapModel = models.custom_swap;
const custom_deposite = models.custom_deposite
const moment = require('moment');
const fetchAllAccounts = async (req, res, next) => {

    try {
        let accountInfo = await accountModel.findAll({
            attributes: { exclude: ['password'] },
            include: [accountsDetailModel]
        });

        if (accountInfo && accountInfo.length > 0) {
            accountInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: accountInfo });
        }
        return res.status(200).json({ rows: [] });

    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllSymbol = async (req, res, next) => {
    try {
        let symbolInfo = await symbolModel.findAll({ raw: true });
        return res.status(200).json({ rows: symbolInfo });
    }
    catch (err) {
        return res.status(err.status || 500).json(err);
    };

}


const fetchAllSymbolByAccount = async (req, res, next) => {
    try {
        const { account_id } = req.params;

        let rows = await historyOrderModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('symbol')), 'symbol']],
            where: { account_id: account_id }
        });

        if (rows && rows.length > 0) {
            let allSymbols = rows.filter(data => data.symbol != '').map(data => data.symbol);
            return res.status(200).json({ rows: allSymbols });
        }

        return res.status(200).json({ rows });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolOpenBkp = async (req, res, next) => {
    try {
        const { symbol } = req.body;
        let openOrderInfo = await openOrderModel.findAll({
            where: { symbol: symbol },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });

        if (openOrderInfo && openOrderInfo.length > 0) {
            openOrderInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: openOrderInfo });
        }
        return res.status(200).json({ rows: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllAccountsBySymbolHistoryBkp = async (req, res, next) => {
    try {
        const { symbol } = req.body;

        let uniqueAccounts = await historyOrderModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('account_id')), 'account_id']],
            where: { symbol: symbol }
        });

        let historyNewOrderInfo = [];
        if (uniqueAccounts && uniqueAccounts.length > 0) {
            historyNewOrderInfo = await Promise.all(uniqueAccounts.map(async (data) => {
                let historyOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where: { account_id: data.account_id, symbol: symbol },
                    include: [{
                        attributes: ['login', 'id', 'alias'],
                        model: accountModel
                    }]
                });
                if (historyOrderInfos && historyOrderInfos.length > 0) {
                    historyOrderInfos.map(nt => nt.toJSON());
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
        if (historyNewOrderInfo && historyNewOrderInfo.length > 0) {
            return res.status(200).json({ rows: historyNewOrderInfo });
        }
        return res.status(200).json({ rows: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllAccountsBySymbolOpen = async (req, res, next) => {
    try {
        const { startdateFrom, enddateFrom, startdateTo, enddateTo, to_account_id, from_account_id, symbol } = req.body;

        let openOrderInfo = await openOrderModel.findAll({
            where: { symbol: symbol },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });

        let fromOpenOrderInfo = await openOrderModel.findAll({
            where: {
                symbol: symbol,
                account_id: from_account_id,
                open_time: {
                    [Op.gte]: startdateFrom,
                    [Op.lt]: enddateFrom,
                }
            },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });
        let toOpenOrderInfo = await openOrderModel.findAll({
            where: {
                symbol: symbol,
                account_id: to_account_id,
                open_time: {
                    [Op.gte]: startdateTo,
                    [Op.lt]: enddateTo,
                }
            },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });

        if (openOrderInfo && openOrderInfo.length > 0) {
            openOrderInfo.map(data => data.toJSON());
            fromOpenOrderInfo.map(data => data.toJSON());
            toOpenOrderInfo.map(data => data.toJSON());
            return res.status(200).json({ rows: openOrderInfo, fromOpenOrderInfo, toOpenOrderInfo });
        }
        return res.status(200).json({ rows: [], fromOpenOrderInfo: [], toOpenOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };

}

const fetchAllAccountsBySymbolHistory = async (req, res, next) => {
    try {
        // const {symbol} = req.body;
        const { startdateFrom, enddateFrom, startdateTo, enddateTo, to_account_id, from_account_id, symbol } = req.body;


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
            where: {
                account_id: from_account_id,
                symbol: symbol,
                open_time: {
                    [Op.gte]: startdateFrom,
                },
                close_time: {
                    [Op.lt]: enddateFrom,
                }
            },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
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
            where: {
                account_id: to_account_id,
                symbol: symbol,
                open_time: {
                    [Op.gte]: startdateTo,
                },
                close_time: {
                    [Op.lt]: enddateTo,
                }
            },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });


        let commissionHistoryOrderInfo = await historyOrderModel.findAll({
            attributes: [
                [Sequelize.literal('SUM(swap)'), 'swap'],
                [Sequelize.literal('SUM(taxes)'), 'taxes'],
                [Sequelize.literal('SUM(commission)'), 'commission'],
                [Sequelize.literal('SUM(lots)'), 'lots'],
                [Sequelize.literal('SUM(profit)'), 'profit'],
                [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
            ],
            where: {
                account_id: commission_acount_id,
                symbol: symbol,
                open_time: {
                    [Op.gte]: startdateTo,
                },
                close_time: {
                    [Op.lt]: enddateTo,
                }
            },
            include: [{
                attributes: ['login', 'id', 'alias'],
                model: accountModel
            }]
        });

        // if(historyNewOrderInfo && historyNewOrderInfo.length>0){
        let rows = [];
        if (fromHistoryOrderInfo.length > 0 || commissionHistoryOrderInfo.length > 0 || toHistoryOrderInfo.length > 0) {
            (fromHistoryOrderInfo.length > 0) && fromHistoryOrderInfo.map(data => data.toJSON());
            (fromHistoryOrderInfo.length > 0) && fromHistoryOrderInfo.map(data => data.toJSON());
            (fromHistoryOrderInfo.length > 0) && fromHistoryOrderInfo.map(data => data.toJSON());
            // (commissionHistoryOrderInfo.length>0) && commissionHistoryOrderInfo.map(data => data.toJSON());

            // rows.push(fromHistoryOrderInfo[0])
            // rows.push(toHistoryOrderInfo[0])


            // return res.status(200).json({ rows: historyNewOrderInfo});
            return res.status(200).json({ rows: rows, fromHistoryOrderInfo: fromHistoryOrderInfo, toHistoryOrderInfo: toHistoryOrderInfo, commissionHistoryOrderInfo: commissionHistoryOrderInfo });
        }
        return res.status(200).json({ rows: [], toHistoryOrderInfo: [], fromHistoryOrderInfo: [], commissionHistoryOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllOpenTradebkp = async (req, res, next) => {
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel]
        });

        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            let enddateFrom = filteredInfo.enddateFrom;


            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            let enddateTo = filteredInfo.enddateTo;

            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;


            let combineSymbols = fromsymbols.concat(tosymbols);
            let uniqueSymbols = combineSymbols.filter((item, i, ar) => ar.indexOf(item) === i);

            if (fromsymbols && fromsymbols.length > 0) {
                openOrderFromInfo = await Promise.all(fromsymbols.map(async (symbol) => {
                    let openOrderInfos = await openOrderModel.findAll({
                        where: {
                            account_id: fromAccountId, symbol: symbol,
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        }
                    });
                    if (openOrderInfos && openOrderInfos.length > 0) {
                        openOrderInfos.map(nt => nt.toJSON());
                        return openOrderInfos[0];
                    }
                    // return [];
                }));
            }
            if (tosymbols && tosymbols.length > 0) {
                openOrderToInfo = await Promise.all(tosymbols.map(async (symbol) => {
                    let openOrderInfos = await openOrderModel.findAll({
                        where: {
                            account_id: toAccountId, symbol: symbol,
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        }
                    });
                    if (openOrderInfos && openOrderInfos.length > 0) {
                        openOrderInfos.map(nt => nt.toJSON());
                        return openOrderInfos[0];
                    }
                }));
            }
            let showArr = []
            let showArrs = []
            Promise.all([uniqueSymbols.forEach((symbol) => {
                let emptyArr = {};
                let emptyArrs = {};
                // showArr[symbol] = [];
                let fromInfo = openOrderFromInfo.find(data => data != null && data.symbol === symbol)
                let toInfo = openOrderToInfo.find(data => data != null && data.symbol === symbol)
                let firstCondition = false;

                if (fromInfo != undefined && toInfo != undefined) {
                    firstCondition = true;
                    let arr = [];
                    let data = {
                        fromInfo,
                        toInfo
                    }
                    arr.push(data)
                    // emptyArrs[symbol] = [data]
                    emptyArrs[symbol] = [{ fromInfo, toInfo }]
                    showArrs.push(emptyArrs);
                }
                // if(fromInfo && fromInfo.length>0){
                if (fromInfo != undefined && !firstCondition) {

                    emptyArrs[symbol] = [{ "fromInfo": fromInfo }]
                    showArrs.push(emptyArrs);

                    // (showArr).push(fromInfo);
                }
                if (toInfo != undefined && !firstCondition) {

                    emptyArrs[symbol] = [{ "toInfo": toInfo }]
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
                showArr: showArr,
                showArrs
            });
        }
        return res.status(200).json({ rows: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

// const fetchCommissionTotal = async (req, res, next) => {
//     let total = 0;
//     try {
//         let totalprice = await historyOrderModel.findAll({
//             where: { order_type: 6, account_id: 7 },
//             raw: true
//         }).then(history => {
//             history.map(item => {
//                 total = total + item.profit;
//                 console.log(item.profit, total, 'profite');
//             })
//             return res.status(200).json({ totalProfit: total });
//         });
//     }
//     catch (err) {
//         return res.status(err.status || 500).json(err);
//     }
// };
const fetchAllOpenTrade = async (req, res, next) => {//open postions data goes here
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true

        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel]
        });
        let swapInfo = await CustomSwapModel.findAll({ raw: true });
        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            // let enddateFrom = filteredInfo.enddateFrom;
            let enddateFrom = (filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == '') ? new Date() : filteredInfo.enddateFrom;
            let tomagicAccount = JSON.parse(filteredInfo.to_magic_number)
            let frommagicAccount = JSON.parse(filteredInfo.from_magic_number)
            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            // let enddateTo = filteredInfo.enddateTo;
            let enddateTo = (filteredInfo.enddateTo == null || filteredInfo.enddateTo == '') ? new Date() : filteredInfo.enddateTo;
            let to_include_exclude = filteredInfo.to_include_exclude_status
            let from_include_exclude = filteredInfo.from_include_exclude_status

            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            let newFromSwapRecord = swapInfo.filter(rec => rec.account_id == fromAccountId);
            let newToSwapRecord = swapInfo.filter(rec => rec.account_id == toAccountId);

            // let CustomSwapModelData = swapInfo.filter(rec => rec.account_id == toAccountId);

            // let CustomSwapModel1 = await CustomSwapModel.findAll({
            // attributes: ['open_value'],

            // where: { account_id: toAccountId },
            // raw: true
            // })
            // console.log(CustomSwapModel1, "CustomSwapModel1===================================");

            // console.log(CustomSwapModelData, 'CustomSwapModelData=============================================');

            // if (CustomSwapModelData.length > 0) {

            // filteredInfo.toAccountHistoryInfo = historyOrderInfonew;

            // }


            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;


            filteredInfo.swapFrominfo = newFromSwapRecord;
            filteredInfo.swapToinfo = newToSwapRecord;
            // let combineSymbols = fromsymbols.concat(tosymbols);
            // let uniqueSymbols = combineSymbols.filter((item, i, ar) => ar.indexOf(item) === i);
            let CustomSwap = await CustomSwapModel.findAll({
                attributes: ['account_id', 'open_value'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })
            // console.log(toAccountId, fromAccountId, fromsymbols, '-------------------------------->')

            let assuemIncludeOrExcludev = [];
            let assuemIncludeOrExcludevTo = [];
            let AllWhereConditions={};
            if (from_include_exclude != 0) {
                if (from_include_exclude === 2) {
                    let numb = await openOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number']],
                        where: { 
                            account_id: fromAccountId,
                            symbol: {
                                [Op.in]: fromsymbols
                            },
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        },
                        // symbol: { fromsymbols},
                        raw: true
                    })
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                    })
                    frommagicAccount = frommagicAccount.map(x => +x)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    AllWhereConditions={
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }

                }else {
                    let numb = await openOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                        where: { 
                            account_id: fromAccountId,
                            symbol: {
                                [Op.in]: fromsymbols
                            },
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        },
                        raw: true
                    })
                    let fromSymbolCheck = [];
                    numb.forEach((data) => {
                        if(fromsymbols.includes(data.symbol)){
                            assuemIncludeOrExcludev.push(data.magic_number)
                            fromSymbolCheck.push(data.symbol)
                        }
                    })
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = frommagicAccount

                    AllWhereConditions={
                        account_id: fromAccountId,
                        symbol: {
                            [Op.in]: fromsymbols
                        },
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }
                }
                console.log(assuemIncludeOrExcludev, "numb ffffff------------------------>")

                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where: AllWhereConditions,
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());

                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === fromAccountId)
                    })

                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }
                    openOrderFromInfo = openOrderInfos;
                }

            } else if(fromsymbols && fromsymbols.length > 0) {

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
                    where: {
                        account_id: fromAccountId,
                        symbol: {
                            [Op.in]: fromsymbols
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    },
                    raw: true
                });


                if (openOrderInfos && openOrderInfos.length > 0) {
                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === fromAccountId)
                    })

                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].open_value !== 0 && foundRec[0].open_value !== undefined) {

                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }

                    openOrderFromInfo = openOrderInfos;
                }
            }
            if (to_include_exclude !== 0) {

            let AllWhereConditions={};

                if (to_include_exclude === 2) {
                    let numb = await openOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number']],
                        where: { 
                            account_id: toAccountId, 
                            symbol: {
                                [Op.in]: tosymbols
                            },
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        },
                        raw: true

                    })
                    numb.forEach((data) => {
                        assuemIncludeOrExcludevTo.push(data.magic_number)
                    })
                    // console.log(tomagicAccount, 'frommagicAccount before')
                    tomagicAccount = tomagicAccount.map(x => +x)
                    // console.log(frommagicAccount, 'frommagicAccount after ')
                    // frommagicAccount = parseInt(frommagicAccount)
                    assuemIncludeOrExcludevTo = assuemIncludeOrExcludevTo.filter(item => !tomagicAccount.includes(item))
                    AllWhereConditions={
                        account_id: toAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludevTo
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }
                }
                else {
                    let numb = await openOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                        where: { 
                            account_id: toAccountId,
                            symbol: {
                                [Op.in]: tosymbols
                            },
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        },
                        raw: true
                    })
                    let toSymbolCheck = [];
                    numb.forEach((data) => {
                        if(tosymbols.includes(data.symbol)){
                            assuemIncludeOrExcludevTo.push(data.magic_number)
                            toSymbolCheck.push(data.symbol)
                        }
                    })
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = frommagicAccount

                    AllWhereConditions={
                        account_id: fromAccountId,
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludevTo
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }

                    // tomagicAccount = tomagicAccount.map(x => +x)
                    // assuemIncludeOrExcludevTo = tomagicAccount
                }

                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where: AllWhereConditions,
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());

                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === toAccountId)
                    })


                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    // openOrderFromInfo = openOrderInfos;
                    openOrderToInfo = openOrderInfos;
                }

            }
            else if (tosymbols && tosymbols.length > 0) {
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
                    where: {
                        account_id: toAccountId,
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    },
                    raw: true

                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === toAccountId)
                    })

                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].open_value !== 0 && foundRec[0].open_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    openOrderToInfo = openOrderInfos;
                }
            }
            return res.status(200).json({
                rows: filteredInfo,
                fromOpenOrderInfo: openOrderFromInfo,
                toOpenOrderInfo: openOrderToInfo,
            });
        }
        return res.status(200).json({ rows: [], fromOpenOrderInfo: [], toOpenOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchLastUpdatedTime = async (req, res, next) => {
    try {
        let filteredInfoTime = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true

        });

        if (filteredInfoTime != null) {

            let fromAccountId = filteredInfoTime.from_account_id;
            let toAccountId = filteredInfoTime.to_account_id;
            let lastUpdated = await accountsDetailModel.findAll({
                attributes: ['last_seen'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })
            let moments = lastUpdated.map(data => moment(data.last_seen))
            let maxDate = moment.max(moments)
            let date = moment(maxDate).utc().format('DD-MM-YYYY  HH:mm:ss')


            return res.status(200).json({ filteredInfoTime: date, });
        }
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}


const fetchAllHistoryTrade = async (req, res, next) => { // close position data goes here
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel]
        });


        let ml = filteredInfo.commission_acount_id;

        let historyOrderInfo = await historyOrderModel.findAll({
            attributes: [
                [Sequelize.literal('SUM(profit)'), 'profit'], // coming null
            ],
            where: { order_type: 6, account_id: ml },
            raw: true
        })


        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let tomagicAccount = JSON.parse(filteredInfo.to_magic_number)
            let frommagicAccount = JSON.parse(filteredInfo.from_magic_number)
            let startdateFrom = filteredInfo.startdateFrom;
            // let enddateFrom = filteredInfo.enddateFrom;
            let enddateFrom = (filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == '') ? new Date() : filteredInfo.enddateFrom;
            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            // let enddateTo = filteredInfo.enddateTo;
            let enddateTo = (filteredInfo.enddateTo == null || filteredInfo.enddateTo == '') ? new Date() : filteredInfo.enddateTo;

            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            let newCommissionRecord = accountInfo.filter(rec => rec.id == ml);
            let to_include_exclude = filteredInfo.to_include_exclude_status
            let from_include_exclude = filteredInfo.from_include_exclude_status

            let equity = (newCommissionRecord[0].accounts_details[0].equity);


            let history_info = 0
            if (historyOrderInfo[0].profit !== null) {
                history_info = eval((historyOrderInfo[0].profit)) - equity

            } else {
                let customDeposite = await custom_deposite.findAll({
                    where: { account_id: ml },
                    raw: true
                })

                if (customDeposite.length) {
                    history_info = equity - customDeposite[0].value

                }
            }

            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;
            filteredInfo.history_info = history_info;
            filteredInfo.accountCommissionInfo = newCommissionRecord;



            let CustomSwap = await CustomSwapModel.findAll({
                attributes: ['account_id', 'close_value'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })

            let assuemIncludeOrExcludev = [];
            let assuemIncludeOrExcludevTo = [];
            let AllWhereConditions={};

            if (from_include_exclude !== 0) {
                if (from_include_exclude === 2) {
                    let numb = await historyOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number']],
                        where: { 
                            account_id: fromAccountId, 
                            symbol: {
                                [Op.in]: fromsymbols
                            },
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        },
                        raw: true

                    })
                    console.log(numb, 'numb________________________=>')
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                    })
                    console.log(frommagicAccount, 'frommagicAccount before')
                    frommagicAccount = frommagicAccount.map(x => +x)
                    console.log(frommagicAccount, 'frommagicAccount after ')
                    console.log(assuemIncludeOrExcludev, 'assuemIncludeOrExcludev')
                    // frommagicAccount = parseInt(frommagicAccount)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))

                    AllWhereConditions={
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }
                }
                else {

                    let numb = await historyOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                        where: { 
                            account_id: fromAccountId,
                            symbol: {
                                [Op.in]: fromsymbols
                            },
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        },
                        raw: true
                    })
                    let fromSymbolCheck = [];
                    numb.forEach((data) => {
                        if(fromsymbols.includes(data.symbol)){
                            assuemIncludeOrExcludev.push(data.magic_number)
                            fromSymbolCheck.push(data.symbol)
                        }
                    })

                    AllWhereConditions={
                        account_id: fromAccountId,
                        symbol: {
                            [Op.in]: fromsymbols
                        },
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = frommagicAccount

                    // console.log(assuemIncludeOrExcludev, "numb------------------------>")
                }


                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where: AllWhereConditions,
                    // where: {
                    //     account_id: fromAccountId,
                    //     // symbol: {
                    //     //     [Op.in]: fromsymbols
                    //     // },
                    //     magic_number: {

                    //         [Op.in]: assuemIncludeOrExcludev
                    //     },

                    //     open_time: {
                    //         [Op.gte]: startdateFrom,
                    //         [Op.lt]: enddateFrom,
                    //     }
                    // },
                    raw: true
                });

                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());


                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === fromAccountId)
                    })


                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }


                    openOrderFromInfo = openOrderInfos;
                }

            }


            else if (fromsymbols && fromsymbols.length > 0) {


                // let custom = CustomSwap.length>0? CustomSwap[0].close_value: 0
                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where: {
                        account_id: fromAccountId,
                        symbol: {
                            [Op.in]: fromsymbols
                        },

                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    },
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());


                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === fromAccountId)
                    })


                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }


                    openOrderFromInfo = openOrderInfos;
                }
            }

            if (to_include_exclude !== 0) {

                if (to_include_exclude === 2) {
                    let numb = await historyOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number']],
                        where: { 
                            account_id: toAccountId, 
                            symbol: {
                                [Op.in]: tosymbols
                            },
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        },
                        
                        raw: true

                    })
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                    })
                    console.log(tomagicAccount, 'frommagicAccount before')
                    frommagicAccount = tomagicAccount.map(x => +x)
                    console.log(tomagicAccount, 'frommagicAccount after ')
                    // frommagicAccount = parseInt(frommagicAccount)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !tomagicAccount.includes(item))

                }
                else {

                    let numb = await historyOrderModel.findAll({
                        attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                        where: { 
                            account_id: toAccountId,
                            symbol: {
                                [Op.in]: tosymbols
                            },
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        },
                        raw: true
                    })
                    let toSymbolCheck = [];
                    numb.forEach((data) => {
                        if(tosymbols.includes(data.symbol)){
                            assuemIncludeOrExcludevTo.push(data.magic_number)
                            toSymbolCheck.push(data.symbol)
                        }
                    })

                    AllWhereConditions={
                        account_id: toAccountId,
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludevTo
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }

                    // tomagicAccount = tomagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = tomagicAccount

                    // console.log(assuemIncludeOrExcludev, "numb------------------------>")
                }
                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],
                    where:AllWhereConditions,
                    // where: {
                    //     account_id: toAccountId,
                    //     // symbol: {
                    //     //     [Op.in]: tosymbols
                    //     // },
                    //     magic_number: {

                    //         [Op.in]: assuemIncludeOrExcludev
                    //     },

                    //     open_time: {
                    //         [Op.gte]: startdateFrom,
                    //         [Op.lt]: enddateFrom,
                    //     }
                    // },
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());


                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === toAccountId)
                    })


                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }


                    openOrderFromInfo = openOrderInfos;
                }

            }

            else if (tosymbols && tosymbols.length > 0) {
                // let CustomSwap = await CustomSwapModel.findAll({
                // attributes: ['close_value'],

                // where: { account_id: toAccountId},
                // raw: true
                // })
                // let data = CustomSwap.length>0? CustomSwap[0].close_value:0

                let openOrderInfos = await historyOrderModel.findAll({
                    attributes: [
                        [Sequelize.literal('SUM(swap)'), 'swap'],
                        [Sequelize.literal('SUM(taxes)'), 'taxes'],
                        [Sequelize.literal('SUM(commission)'), 'commission'],
                        [Sequelize.literal('SUM(lots)'), 'lots'],
                        [Sequelize.literal('SUM(profit)'), 'profit'],
                        [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    ],

                    where: {
                        account_id: toAccountId,
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    },
                    raw: true
                });

                if (openOrderInfos && openOrderInfos.length > 0) {
                    if (openOrderInfos !== null) {
                        let foundRec = CustomSwap.filter(data => {
                            return (data.account_id === toAccountId)
                        })

                        if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                            let objectINfo = openOrderInfos[0]
                            Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                            let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                            openOrderInfos[0].swap = openOrderInfos[0].swap + value
                            openOrderInfos[0].total = openOrderInfos[0].total + value




                        }




                    }
                    openOrderToInfo = openOrderInfos;

                }
            }
            return res.status(200).json({
                rows: filteredInfo,
                fromHistoryOrderInfo: openOrderFromInfo,
                toHistoryOrderInfo: openOrderToInfo,
            });
        }
        return res.status(200).json({ rows: [], fromHistoryOrderInfo: [], toHistoryOrderInfo: [], commissionHistoryOrderInfo: [] });
    } catch (err) {
        console.log(err)
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
    fetchAllSymbolByAccount,
    fetchLastUpdatedTime
};
