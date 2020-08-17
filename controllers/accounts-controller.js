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
const CustomDeposite = models.custom_deposite
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
        let symbolInfo = await symbolModel.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('name')), 'name']]
        });
        return res.status(200).json({ rows: symbolInfo });
    }
    catch (err) {
        return res.status(err.status || 500).json(err);
    };

}

//open postions data goes here
const fetchAllOpenTrade = async (req, res, next) => {
    try {
        // Get Filter Profile Data Using Status 1
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });

        // Get Account Detail
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel]
        });

        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            // let assuemIncludeOrExcludev = [];
            // let assuemIncludeOrExcludeSymbol = [];
            // let assuemIncludeOrExcludeToSymbol = [];
            // let assuemIncludeOrExcludevTo = [];

            //Account "From" Detail
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            let enddateFrom = (filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == '') ? new Date() : filteredInfo.enddateFrom;

            let frommagicAccount = (filteredInfo.from_magic_number != '' && filteredInfo.from_magic_number != null) && JSON.parse(filteredInfo.from_magic_number)
            let from_include_exclude = filteredInfo.from_include_exclude_status;

            //Account "To" Detail
            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            let enddateTo = (filteredInfo.enddateTo == null || filteredInfo.enddateTo == '') ? new Date() : filteredInfo.enddateTo;

            let tomagicAccount = (filteredInfo.to_magic_number != '' && filteredInfo.to_magic_number != null) && JSON.parse(filteredInfo.to_magic_number)
            let to_include_exclude = filteredInfo.to_include_exclude_status


            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);

            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;

            let CustomSwap = await CustomSwapModel.findAll({
                attributes: ['account_id', 'open_value'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })

            //Check Include Exclude Status And Symbols For Account "From"
            if (from_include_exclude != 0) {
                let AllWhereConditions = {};

                if (from_include_exclude === 2) {
                    // let numb = await openOrderModel.findAll({
                    //     attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                    //     where: {
                    //         account_id: fromAccountId,
                    //         symbol: {
                    //             [Op.in]: fromsymbols
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateFrom,
                    //             [Op.lt]: enddateFrom,
                    //         }
                    //     },
                    //     raw: true
                    // })
                    // numb.forEach((data) => {
                    //     assuemIncludeOrExcludev.push(data.magic_number)
                    //     assuemIncludeOrExcludeSymbol.push(data.symbol)
                    // })
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    // assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))
                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.notIn]: frommagicAccount
                        },
                        symbol: {
                            [Op.in]: fromsymbols
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }

                } else {
                    // let numb = await openOrderModel.findAll({
                    //     attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                    //     where: {
                    //         account_id: fromAccountId,
                    //         symbol: {
                    //             [Op.in]: fromsymbols
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateFrom,
                    //             [Op.lt]: enddateFrom,
                    //         }
                    //     },
                    //     raw: true
                    // })
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // let allRecdd = numb.filter(item => frommagicAccount.includes(item.magic_number))

                    // if (allRecdd && allRecdd.length != 0) {

                    // numb.forEach((data) => {
                    //     if (fromsymbols.includes(data.symbol)) {
                    //         assuemIncludeOrExcludev.push(data.magic_number)
                    //     }
                    // })

                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: frommagicAccount
                        },
                        symbol: {
                            [Op.in]: fromsymbols
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }
                    // } else {

                    //     AllWhereConditions = {
                    //         account_id: fromAccountId,
                    //         magic_number: {
                    //             [Op.in]: frommagicAccount
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateFrom,
                    //             [Op.lt]: enddateFrom,
                    //         }
                    //     }
                    // }
                }

                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
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

                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === fromAccountId)
                    })

                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].open_value !== 0 && foundRec[0].open_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value

                    }
                    openOrderFromInfo = openOrderInfos;
                }

            } else if (fromsymbols && fromsymbols.length > 0) {

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
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    openOrderFromInfo = openOrderInfos;
                }
            }

            //Check Include Exclude Status And Symbols For Account "From"
            if (to_include_exclude !== 0) {
                let AllWhereConditions = {};

                if (to_include_exclude === 2) {
                    // let numb = await openOrderModel.findAll({
                    //     attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                    //     where: {
                    //         account_id: toAccountId,
                    //         symbol: {
                    //             [Op.in]: tosymbols
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateTo,
                    //             [Op.lt]: enddateTo,
                    //         }
                    //     },
                    //     raw: true

                    // })
                    // numb.forEach((data) => {
                    //     assuemIncludeOrExcludevTo.push(data.magic_number)
                    //     assuemIncludeOrExcludeToSymbol.push(data.symbol)
                    // })
                    // tomagicAccount = tomagicAccount.map(x => +x)
                    // assuemIncludeOrExcludevTo = assuemIncludeOrExcludevTo.filter(item => !tomagicAccount.includes(item))
                    // assuemIncludeOrExcludeToSymbol = assuemIncludeOrExcludeToSymbol.filter(item => tosymbols.includes(item))


                    AllWhereConditions = {
                        account_id: toAccountId,
                        magic_number: {
                            [Op.notIn]: tomagicAccount
                        },
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }
                } else {
                    // let numb = await openOrderModel.findAll({
                    //     attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                    //     where: {
                    //         account_id: toAccountId,
                    //         symbol: {
                    //             [Op.in]: tosymbols
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateTo,
                    //             [Op.lt]: enddateTo,
                    //         }
                    //     },
                    //     raw: true
                    // })
                    // let toSymbolCheck = [];

                    // tomagicAccount = tomagicAccount.map(x => +x)
                    // let allRecdd = numb.filter(item => tomagicAccount.includes(item.magic_number))
                    // if (allRecdd && allRecdd.length != 0) {
                    //     numb.forEach((data) => {
                    //         if (tosymbols.includes(data.symbol)) {
                    //             assuemIncludeOrExcludevTo.push(data.magic_number)
                    //             toSymbolCheck.push(data.symbol)
                    //         }
                    //     })

                    AllWhereConditions = {
                        account_id: toAccountId,
                        magic_number: {
                            [Op.in]: tomagicAccount
                        },
                        symbol: {
                            [Op.in]: tosymbols
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }
                    // } else {
                    //     AllWhereConditions = {
                    //         account_id: toAccountId,
                    //         magic_number: {
                    //             [Op.in]: assuemIncludeOrExcludevTo
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateTo,
                    //             [Op.lt]: enddateTo,
                    //         }
                    //     }
                    // }

                }

                let openOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
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

                    let foundRec = CustomSwap.filter(data => {
                        return (data.account_id === toAccountId)
                    })


                    if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].open_value !== 0 && foundRec[0].open_value !== undefined) {
                        let objectINfo = openOrderInfos[0]

                        Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0
                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    openOrderToInfo = openOrderInfos;
                }

            } else if (tosymbols && tosymbols.length > 0) {
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
                        let value = foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0

                        openOrderInfos[0].swap = openOrderInfos[0].swap + value
                        openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    openOrderToInfo = openOrderInfos;
                }
            }

            //Send Api Response
            return res.status(200).json({
                rows: filteredInfo,
                fromOpenOrderInfo: openOrderFromInfo,
                toOpenOrderInfo: openOrderToInfo,
                // accountTableDetails: accountTableDetails,
                // customDepositeTable: customDepositeTable,
                // customSwapTable: customSwapTable,
                // openOrderData:openOrderData,
                // historyOrderData:historyOrderData

            });
        }
        return res.status(200).json({ rows: [], OpenOrder: [], fromOpenOrderInfo: [], toOpenOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchLastUpdatedTime = async (req, res, next) => {
    try {
        // Get Filter Profile Data Using Status 1
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true

        });

        // Get Last Seen From Account Detail Model
        if (filteredInfo != null) {
            let fromAccountId = filteredInfo.from_account_id;
            let toAccountId = filteredInfo.to_account_id;

            let lastUpdated = await accountsDetailModel.findAll({
                attributes: ['last_seen'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })

            let moments = lastUpdated.map(data => moment(data.last_seen))
            let maxDate = moment.min(moments)
            let date = moment(maxDate).utc().format('DD-MM-YYYY  HH:mm:ss')

            return res.status(200).json({ filteredInfoTime: date, });
        }
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchAllHistoryTrade = async (req, res, next) => { // close position data goes here
    try {
        // Get Filter Profile Data Using Status 1
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });

        // Get Account Detail
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel]
        });

        let commission_acount_id = filteredInfo.commission_acount_id;

        // Calculate Profit According To Order Type
        let historyOrderInfo = await historyOrderModel.findAll({
            attributes: [
                [Sequelize.literal('SUM(profit)'), 'profit'], // coming null
            ],
            where: { order_type: 6, account_id: commission_acount_id },
            raw: true
        })
        
        // let customSwapTable = await CustomSwapModel.findAll({
        //     attributes: { exclude: ['id'] },
        //     raw: true,
        // });

        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let assuemIncludeOrExcludev = [];
            let assuemIncludeOrExcludevTo = [];
            let assuemIncludeOrExcludeSymbol = [];
            let history_info = 0

            //Account "From" Detail
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);

            let frommagicAccount = (filteredInfo.from_magic_number != '' && filteredInfo.from_magic_number != null) && JSON.parse(filteredInfo.from_magic_number);
            let from_include_exclude = filteredInfo.from_include_exclude_status;

            let startdateFrom = filteredInfo.startdateFrom;
            let enddateFrom = (filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == '') ? new Date() : filteredInfo.enddateFrom;

            //Account "To" Detail
            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);

            let tomagicAccount = (filteredInfo.to_magic_number != '' && filteredInfo.to_magic_number != null) && JSON.parse(filteredInfo.to_magic_number);
            let to_include_exclude = filteredInfo.to_include_exclude_status

            let startdateTo = filteredInfo.startdateTo;
            let enddateTo = (filteredInfo.enddateTo == null || filteredInfo.enddateTo == '') ? new Date() : filteredInfo.enddateTo;

            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);

            let newCommissionRecord = accountInfo.filter(rec => rec.id == commission_acount_id);
            
            let equity = (newCommissionRecord && newCommissionRecord.length > 0) ? (newCommissionRecord[0].accounts_details[0].equity) : 0;

            if (historyOrderInfo[0].profit !== null) {
                history_info = eval((historyOrderInfo[0].profit)) - equity
            } else {
                let customDeposite = await CustomDeposite.findAll({
                    where: { account_id: commission_acount_id },
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

            if (from_include_exclude !== 0) {
                if (from_include_exclude === 2) {
                    // let numb = await historyOrderModel.findAll({
                    //     attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                    //     where: {
                    //         account_id: fromAccountId,
                    //         symbol: {
                    //             [Op.in]: fromsymbols
                    //         },
                    //         open_time: {
                    //             [Op.gte]: startdateFrom,
                    //             [Op.lt]: enddateFrom,
                    //         }
                    //     },
                    //     raw: true

                    // })
                    // numb.forEach((data) => {
                    //     assuemIncludeOrExcludev.push(data.magic_number)
                    //     assuemIncludeOrExcludeSymbol.push(data.symbol)
                    // })
                    frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    // assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))


                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.notIn]: frommagicAccount
                        },
                        symbol: {
                            [Op.in]: fromsymbols
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

                    frommagicAccount = frommagicAccount.map(x => +x);
                    let allRecdd = numb.filter(item => frommagicAccount.includes(item.magic_number));
                    if (allRecdd && allRecdd.length != 0) {
                        numb.forEach((data) => {
                            if (fromsymbols.includes(data.symbol)) {
                                assuemIncludeOrExcludev.push(data.magic_number)
                            }
                        })

                        AllWhereConditions = {
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
                    } else {
                        AllWhereConditions = {
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
                    raw: true
                });

                if (openOrderInfos && openOrderInfos.length > 0) {

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
                    let assuemIncludeOrExcludeToSymbol = [];
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
                    numb.forEach((data) => {
                        assuemIncludeOrExcludevTo.push(data.magic_number)
                        assuemIncludeOrExcludeToSymbol.push(data.symbol)

                    })
                    tomagicAccount = tomagicAccount.map(x => +x)
                    assuemIncludeOrExcludevTo = assuemIncludeOrExcludevTo.filter(item => !tomagicAccount.includes(item))
                    assuemIncludeOrExcludeToSymbol = assuemIncludeOrExcludeToSymbol.filter(item => tosymbols.includes(item))


                    AllWhereConditions = {
                        account_id: toAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludevTo
                        },
                        symbol: {
                            [Op.in]: assuemIncludeOrExcludeToSymbol
                        },
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    }
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
                    tomagicAccount = tomagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => tomagicAccount.includes(item.magic_number))

                    if (allRecdd && allRecdd.length != 0) {

                        numb.forEach((data) => {
                            if (tosymbols.includes(data.symbol)) {
                                assuemIncludeOrExcludevTo.push(data.magic_number)
                                toSymbolCheck.push(data.symbol)
                            }
                        })

                        AllWhereConditions = {
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
                    } else {
                        AllWhereConditions = {
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
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {

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
                    openOrderToInfo = openOrderInfos;
                }

            }

            else if (tosymbols && tosymbols.length > 0) {
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
                customSwapTable: customSwapTable
            });
        }
        return res.status(200).json({ rows: [], fromHistoryOrderInfo: [], toHistoryOrderInfo: [], commissionHistoryOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

const fetchStatusData = async (req, res, next) => {
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });
        let filterInfo = filteredInfo;

        let fromAccountInfo = await accountModel.findOne({
            where: { id: filterInfo.from_account_id },
            attributes: ['login', 'id', 'alias']
        });


        let toAccountInfo = await accountModel.findOne({
            where: { id: filterInfo.to_account_id },
            attributes: ['login', 'id', 'alias']
        });

        let frSymJson = filterInfo.from_symbols;
        let fromsymbols = JSON.parse(frSymJson);
        let toSymJson = filterInfo.to_symbols;
        let toAccountId = filteredInfo.to_account_id;
        let fromAccountId = filteredInfo.from_account_id;
        let tosymbols = JSON.parse(toSymJson);
        let tomagicAccount = (filterInfo.to_magic_number != '' && filterInfo.to_magic_number != null) && JSON.parse(filterInfo.to_magic_number)
        let frommagicAccount = (filterInfo.from_magic_number != '' && filterInfo.from_magic_number != null) && JSON.parse(filterInfo.from_magic_number);
        let to_include_exclude = filterInfo.to_include_exclude_status
        let from_include_exclude = filterInfo.from_include_exclude_status;
        let startdateFrom = filterInfo.startdateFrom;
        let enddateFrom = (filterInfo.enddateFrom == null || filterInfo.enddateFrom == '') ? new Date() : filterInfo.enddateFrom;
        let startdateTo = filterInfo.startdateTo;
        let enddateTo = (filterInfo.enddateTo == null || filterInfo.enddateTo == '') ? new Date() : filterInfo.enddateTo;
        // let fromSymbolInfo = await symbolModel.findAll({
        //     where: { name: frSymbol[0], login: fromAccountInfo.login },
        //     raw: true

        // });
        // let toSymbolInfo = await symbolModel.findAll({
        //     where: { name: toSymbol[0], login: toAccountInfo.login },
        //     raw: true
        // });
        let fromSymbolInfo = [];
        let toSymbolInfo = [];
        let fromOpenOrderInfos = [];
        let toOpenOrderInfos = [];
        if (filterInfo != null) {
            // console.log(from_include_exclude, startdateFrom,enddateFrom ,fromsymbols,fromAccountId, 'from_include_exclude')
            if (from_include_exclude != 0) {
                let assuemIncludeOrExcludeSymbol = []
                let assuemIncludeOrExcludev = []
                if (from_include_exclude == 2) {

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
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                        assuemIncludeOrExcludeSymbol.push(data.symbol)
                    })
                    frommagicAccount = frommagicAccount.map(x => +x)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))

                    fromSymbolInfo = await symbolModel.findAll({
                        where: { name: assuemIncludeOrExcludeSymbol[0], login: fromAccountInfo.login },
                        raw: true
                    });
                    fromOpenOrderInfos = await openOrderModel.findAll({
                        attributes: [
                            'order_type',
                            [Sequelize.literal('SUM(lots)'), 'lots']
                        ],
                        where: {
                            account_id: fromAccountInfo.id,
                            symbol: assuemIncludeOrExcludeSymbol[0],
                            open_time: {
                                [Op.gte]: startdateFrom,
                                [Op.lt]: enddateFrom,
                            }
                        },
                        raw: true
                    });
                } else {

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

                    frommagicAccount = frommagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => frommagicAccount.includes(item.magic_number))
                    if (allRecdd && allRecdd.length != 0) {
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
                        numb.forEach((data) => {
                            assuemIncludeOrExcludev.push(data.magic_number)
                            assuemIncludeOrExcludeSymbol.push(data.symbol)
                        })
                        frommagicAccount = frommagicAccount.map(x => +x)
                        assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => frommagicAccount.includes(item))
                        assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))
                        toSymbolInfo = await symbolModel.findAll({
                            where: { name: assuemIncludeOrExcludeSymbol[0], login: fromAccountInfo.login },
                            raw: true
                        });
                        fromOpenOrderInfos = await openOrderModel.findAll({
                            attributes: [
                                'order_type',
                                [Sequelize.literal('SUM(lots)'), 'lots']
                            ],
                            where: {
                                account_id: fromAccountInfo.id,
                                symbol: assuemIncludeOrExcludeSymbol[0],
                                open_time: {
                                    [Op.gte]: startdateFrom,
                                    [Op.lt]: enddateFrom,
                                }
                            },
                            raw: true
                        });
                    }

                }
            } else {

                toOpenOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
                        [Sequelize.literal('SUM(lots)'), 'lots']
                    ],
                    where: {
                        account_id: fromAccountInfo.id,
                        symbol: fromsymbols[0],
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    },
                    raw: true
                });
                fromSymbolInfo = await symbolModel.findAll({
                    where: { name: fromsymbols[0], login: fromAccountInfo.login },
                    raw: true
                });
            }

            console.log(to_include_exclude, 'to_include_exclude------------------------------------------------')
            if (to_include_exclude != 0) {
                let assuemIncludeOrExcludeSymbol = []
                let assuemIncludeOrExcludev = []
                if (to_include_exclude == 2) {

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
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                        assuemIncludeOrExcludeSymbol.push(data.symbol)
                    })
                    tomagicAccount = tomagicAccount.map(x => +x)

                    console.log(assuemIncludeOrExcludev, 'assuemIncludeOrExcludev')
                    console.log(assuemIncludeOrExcludeSymbol, 'assuemIncludeOrExcludeSymbol')
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !tomagicAccount.includes(item))
                    assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => tosymbols.includes(item))

                    toSymbolInfo = await symbolModel.findAll({
                        where: { name: assuemIncludeOrExcludeSymbol[0], login: toAccountInfo.login },
                        raw: true
                    });

                    toOpenOrderInfos = await openOrderModel.findAll({
                        attributes: [
                            'order_type',
                            [Sequelize.literal('SUM(lots)'), 'lots']
                        ],
                        where: {
                            account_id: toAccountInfo.id,
                            symbol: assuemIncludeOrExcludeSymbol[0],
                            open_time: {
                                [Op.gte]: startdateTo,
                                [Op.lt]: enddateTo,
                            }
                        },
                        raw: true
                    });
                } else {

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

                    tomagicAccount = tomagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => tomagicAccount.includes(item.magic_number))
                    if (allRecdd && allRecdd.length != 0) {
                        let numb = await openOrderModel.findAll({
                            attributes: [[Sequelize.literal('DISTINCT(magic_number)'), 'magic_number'], 'symbol'],
                            where: {
                                account_id: toAccountId,
                                symbol: {
                                    [Op.in]: tosymbols
                                }
                            },
                            raw: true
                        })
                        numb.forEach((data) => {
                            assuemIncludeOrExcludev.push(data.magic_number)
                            assuemIncludeOrExcludeSymbol.push(data.symbol)
                        })
                        tomagicAccount = tomagicAccount.map(x => +x)
                        assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => tomagicAccount.includes(item))
                        assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => tosymbols.includes(item))
                        toSymbolInfo = await symbolModel.findAll({
                            where: { name: assuemIncludeOrExcludeSymbol[0], login: toAccountInfo.login },
                            raw: true
                        });
                        toOpenOrderInfos = await openOrderModel.findAll({
                            attributes: [
                                'order_type',
                                [Sequelize.literal('SUM(lots)'), 'lots']
                            ],
                            where: {
                                account_id: toAccountInfo.id,
                                symbol: assuemIncludeOrExcludeSymbol[0],
                                open_time: {
                                    [Op.gte]: startdateTo,
                                    [Op.lt]: enddateTo,
                                }
                            },
                            raw: true
                        });

                    }
                }
            } else {

                toOpenOrderInfos = await openOrderModel.findAll({
                    attributes: [
                        'order_type',
                        [Sequelize.literal('SUM(lots)'), 'lots']
                    ],
                    where: {
                        account_id: toAccountInfo.id,
                        symbol: tosymbols[0],
                        open_time: {
                            [Op.gte]: startdateTo,
                            [Op.lt]: enddateTo,
                        }
                    },
                    raw: true
                });
                toSymbolInfo = await symbolModel.findAll({
                    where: { name: tosymbols[0], login: toAccountInfo.login },
                    raw: true
                });
            }
        }


        return res.status(200).json({
            rows: filterInfo,
            fromAccounts: fromAccountInfo,
            fromSymbol: fromSymbolInfo.length > 0 ? fromSymbolInfo[0] : {},
            toAccounts: toAccountInfo,
            toSymbol: toSymbolInfo.length > 0 ? toSymbolInfo[0] : {},
            fromOpenOrderInfos: fromOpenOrderInfos,
            toOpenOrderInfos: toOpenOrderInfos
        });
    }
    catch (err) {
        return res.status(err.status || 500).json(err);
    };
}

module.exports = {
    fetchAllAccounts,
    fetchAllSymbol,
    fetchAllOpenTrade,
    fetchAllHistoryTrade,
    fetchLastUpdatedTime,
    fetchStatusData,
};
