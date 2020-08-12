"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require('../models');
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order; ``
const filteredProfileModel = models.filtered_profile;
const CustomSwapModel = models.custom_swap;
const CustomDeposite = models.custom_deposite





const calculatingOpenTrade = async (req, res, next) => {//open postions data goes here
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });
        console.log(filteredInfo,'filterProfile..');
        let accountInfo = await accountModel.findAll({
            attributes: ['login', 'id', 'alias'],
            include: [accountsDetailModel],
            raw: true
        });
        console.log(accountInfo, 'accountInfo');
        let swapInfo = await CustomSwapModel.findAll({ raw: true });
        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let totalOfFromOpenOrder = 0;
            let totalOfToOpenOrder = 0;
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            let startdateFrom = filteredInfo.startdateFrom;
            let enddateFrom = (filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == '') ? new Date() : filteredInfo.enddateFrom;

            let tomagicAccount = (filteredInfo.to_magic_number!='' && filteredInfo.to_magic_number!=null) && JSON.parse(filteredInfo.to_magic_number)
            let frommagicAccount = (filteredInfo.from_magic_number!='' && filteredInfo.from_magic_number!=null )&& JSON.parse(filteredInfo.from_magic_number)

            let toAccountId = filteredInfo.to_account_id;
            let tosymbols = JSON.parse(filteredInfo.to_symbols);
            let startdateTo = filteredInfo.startdateTo;
            let enddateTo = (filteredInfo.enddateTo == null || filteredInfo.enddateTo == '') ? new Date() : filteredInfo.enddateTo;
            let to_include_exclude = filteredInfo.to_include_exclude_status
            let from_include_exclude = filteredInfo.from_include_exclude_status
            let newRecord = accountInfo.filter(rec => rec.id == fromAccountId);
            let newToRecord = accountInfo.filter(rec => rec.id == toAccountId);
            let newFromSwapRecord = swapInfo.filter(rec => rec.account_id == fromAccountId);
            let newToSwapRecord = swapInfo.filter(rec => rec.account_id == toAccountId);

            filteredInfo.accountFromInfo = newRecord;
            filteredInfo.accountToInfo = newToRecord;
            filteredInfo.swapFrominfo = newFromSwapRecord;
            filteredInfo.swapToinfo = newToSwapRecord;
            let CustomSwap = await CustomSwapModel.findAll({
                attributes: ['account_id', 'open_value'],
                where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
                raw: true
            })

            let assuemIncludeOrExcludev = [];
            let assuemIncludeOrExcludeSymbol = [];
            let assuemIncludeOrExcludeToSymbol = [];
            let assuemIncludeOrExcludevTo = [];
            let AllWhereConditions = {};
            if (from_include_exclude != 0) {
                if (from_include_exclude === 2) {
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
                        // symbol: { fromsymbols},
                        raw: true
                    })
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                        assuemIncludeOrExcludeSymbol.push(data.symbol)
                    })
                    frommagicAccount = frommagicAccount.map(x => +x)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))
                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        symbol: {
                            [Op.in]: assuemIncludeOrExcludeSymbol
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }

                }
                else {
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
                    // let fromSymbolCheck = [];
                    frommagicAccount = frommagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => frommagicAccount.includes(item.magic_number))

                    if(allRecdd && allRecdd.length!=0){

                    numb.forEach((data) => {
                        if (fromsymbols.includes(data.symbol)) {
                            assuemIncludeOrExcludev.push(data.magic_number)
                            // fromSymbolCheck.push(data.symbol)
                        }
                    })
                    // frommagicAccount = frommagicAccount.map(x => +x)
                    // assuemIncludeOrExcludev = frommagicAccount

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
                } else{

                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: frommagicAccount
                        },
                        open_time: {
                            [Op.gte]: startdateFrom,
                            [Op.lt]: enddateFrom,
                        }
                    }
                }
                

                }

                let openOrderInfos = await openOrderModel.findAll({
                   
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
                    for (let openOrderItem of openOrderInfos) {
                        totalOfFromOpenOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderFromInfo = openOrderInfos;
                }

            } else if (fromsymbols && fromsymbols.length > 0) {
                 
                let openOrderInfos = await openOrderModel.findAll({
                  
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
                    for (let openOrderItem of openOrderInfos) {
                        totalOfFromOpenOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderFromInfo = openOrderInfos;
                }
            }
            if (to_include_exclude !== 0) {

                let AllWhereConditions = {};

                if (to_include_exclude === 2) {
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
                        assuemIncludeOrExcludevTo.push(data.magic_number)
                        assuemIncludeOrExcludeToSymbol.push(data.symbol)
                    })
                    // console.log(tomagicAccount, 'frommagicAccount before')
                    tomagicAccount = tomagicAccount.map(x => +x)
                    // console.log(frommagicAccount, 'frommagicAccount after ')
                    // frommagicAccount = parseInt(frommagicAccount)
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

                    tomagicAccount = tomagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => tomagicAccount.includes(item.magic_number))
                    if(allRecdd && allRecdd.length!=0){
                        numb.forEach((data) => {
                            if (tosymbols.includes(data.symbol)) {
                                assuemIncludeOrExcludevTo.push(data.magic_number)
                                toSymbolCheck.push(data.symbol)
                            }
                        })
                        // frommagicAccount = frommagicAccount.map(x => +x)
                        // assuemIncludeOrExcludev = frommagicAccount

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
                    }else{
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

                    // tomagicAccount = tomagicAccount.map(x => +x)
                    // assuemIncludeOrExcludevTo = tomagicAccount
                }

                let openOrderInfos = await openOrderModel.findAll({
                    // attributes: [
                    //     [Sequelize.literal('SUM(swap)'), 'swap'],
                    //     [Sequelize.literal('SUM(taxes)'), 'taxes'],
                    //     [Sequelize.literal('SUM(commission)'), 'commission'],
                    //     [Sequelize.literal('SUM(lots)'), 'lots'],
                    //     [Sequelize.literal('SUM(profit)'), 'profit'],
                    //     [Sequelize.literal('SUM(profit+commission+taxes+swap)'), 'total']
                    // ],
                    where: AllWhereConditions,
                    raw: true
                });
                if (openOrderInfos && openOrderInfos.length > 0) {
                    // openOrderInfos.map(nt => nt.toJSON());

                    // let foundRec = CustomSwap.filter(data => {
                    //     return (data.account_id === toAccountId)
                    // })


                    // if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].open_value !== 0 && foundRec[0].open_value !== undefined) {
                    //     let objectINfo = openOrderInfos[0]

                    //     Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                    //     let value = foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0
                    //     openOrderInfos[0].swap = openOrderInfos[0].swap + value
                    //     // openOrderInfos[0].total = openOrderInfos[0].total + value
                    // }
                    // openOrderFromInfo = openOrderInfos;
                    for (let openOrderItem of openOrderInfos) {
                        totalOfToOpenOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderToInfo = openOrderInfos;
                }

            }
            else if (tosymbols && tosymbols.length > 0) {
                let openOrderInfos = await openOrderModel.findAll({
                    // attributes: [
                    //     'order_type',
                    //     [Sequelize.literal('SUM(swap)'), 'swap'],
                    //     [Sequelize.literal('SUM(taxes)'), 'taxes'],
                    //     [Sequelize.literal('SUM(commission)'), 'commission'],
                    //     [Sequelize.literal('SUM(lots)'), 'lots'],
                    //     [Sequelize.literal('SUM(profit)'), 'profit'],
                    //     [Sequelize.literal('SUM(profit+commission+swap)'), 'total']
                    // ],
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
                        // openOrderInfos[0].total = openOrderInfos[0].total + value
                    }
                    for (let openOrderItem of openOrderInfos) {
                        totalOfToOpenOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderToInfo = openOrderInfos;
                }

            }



            return res.status(200).json({
                rows: filteredInfo,
                fromOpenOrderInfo: openOrderFromInfo,
                toOpenOrderInfo: openOrderToInfo,
                totalOfOpenOrder: totalOfFromOpenOrder + totalOfToOpenOrder
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




const calculatingHistoryTrade = async (req, res, next) => { // close position data goes here
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
        let customSwapTable = await CustomSwapModel.findAll({
            attributes: { exclude: ['id'] },
            raw: true,
        });
        // console.log(customSwapTable, 'customSwapTable----111111----------------------------');


        if (filteredInfo != null) {
            let openOrderFromInfo = [];
            let openOrderToInfo = [];
            let totalOfFromHistoryOrder = 0;
            let totalOfToHistoryOrder = 0;
            let fromAccountId = filteredInfo.from_account_id;
            let fromsymbols = JSON.parse(filteredInfo.from_symbols);
            // let tomagicAccount = JSON.parse(filteredInfo.to_magic_number)
            // let frommagicAccount = JSON.parse(filteredInfo.from_magic_number)

            let tomagicAccount = (filteredInfo.to_magic_number!='' && filteredInfo.to_magic_number!=null) && JSON.parse(filteredInfo.to_magic_number)
            let frommagicAccount = (filteredInfo.from_magic_number!='' && filteredInfo.from_magic_number!=null )&& JSON.parse(filteredInfo.from_magic_number)
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
            let from_include_exclude = filteredInfo.from_include_exclude_status;
            let equity = (newCommissionRecord && newCommissionRecord.length>0) ? (newCommissionRecord[0].accounts_details[0].equity) : 0;


            let history_info = 0
            if (historyOrderInfo[0].profit !== null) {
                history_info = eval((historyOrderInfo[0].profit)) - equity

            } else {
                let customDeposite = await CustomDeposite.findAll({
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
            let AllWhereConditions = {};
            let assuemIncludeOrExcludeSymbol = [];

            if (from_include_exclude !== 0) {
                if (from_include_exclude === 2) {
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
                    numb.forEach((data) => {
                        assuemIncludeOrExcludev.push(data.magic_number)
                        assuemIncludeOrExcludeSymbol.push(data.symbol)
                    })
                    frommagicAccount = frommagicAccount.map(x => +x)
                    assuemIncludeOrExcludev = assuemIncludeOrExcludev.filter(item => !frommagicAccount.includes(item))
                    assuemIncludeOrExcludeSymbol = assuemIncludeOrExcludeSymbol.filter(item => fromsymbols.includes(item))


                    AllWhereConditions = {
                        account_id: fromAccountId,
                        magic_number: {
                            [Op.in]: assuemIncludeOrExcludev
                        },
                        symbol: {
                            [Op.in]: assuemIncludeOrExcludeSymbol
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
                    // let fromSymbolCheck = [];

                    frommagicAccount = frommagicAccount.map(x => +x)
                    let allRecdd = numb.filter(item => frommagicAccount.includes(item.magic_number))
                    if(allRecdd && allRecdd.length!=0){
                        numb.forEach((data) => {
                            if (fromsymbols.includes(data.symbol)) {
                                assuemIncludeOrExcludev.push(data.magic_number)
                                // fromSymbolCheck.push(data.symbol)
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
                    }else{
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
                        // openOrderInfos[0].total = openOrderInfos[0].total + value

                    }

                    for (let openOrderItem of openOrderInfos) {
                        totalOfFromHistoryOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderFromInfo = openOrderInfos;
                }

            }


            else if (fromsymbols && fromsymbols.length > 0) {

                let openOrderInfos = await historyOrderModel.findAll({
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
                        // openOrderInfos[0].total = openOrderInfos[0].total + value

                    }

                    for (let openOrderItem of openOrderInfos) {
                        totalOfFromHistoryOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
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
                    // console.log(tomagicAccount, 'frommagicAccount before')
                    tomagicAccount = tomagicAccount.map(x => +x)
                    // console.log(tomagicAccount, 'frommagicAccount after ')
                    // frommagicAccount = parseInt(frommagicAccount)
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

                    if(allRecdd && allRecdd.length!=0){
                    
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
                }else{
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
                    where: AllWhereConditions,
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


                    // let foundRec = CustomSwap.filter(data => {
                    //     return (data.account_id === toAccountId)
                    // })


                    // if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                    //     let objectINfo = openOrderInfos[0]

                    //     Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                    //     let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                    //     openOrderInfos[0].swap = openOrderInfos[0].swap + value
                    //     // openOrderInfos[0].total = openOrderInfos[0].total + value

                    // }

                    for (let openOrderItem of openOrderInfos) {
                        totalOfToHistoryOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderToInfo = openOrderInfos;
                }

            }

            else if (tosymbols && tosymbols.length > 0) {
                let openOrderInfos = await historyOrderModel.findAll({
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
                    // if (openOrderInfos !== null) {
                    //     let foundRec = CustomSwap.filter(data => {
                    //         return (data.account_id === toAccountId)
                    //     })

                    //     if (openOrderInfos[0].swap !== null && foundRec.length > 0 && foundRec[0].close_value !== 0 && foundRec[0].close_value !== undefined) {
                    //         // let objectINfo = openOrdehistoryOrderDatarInfos[0]
                    //         let objectINfo = openOrderInfos[0]
                    //         Object.keys(objectINfo).forEach((key) => { objectINfo[key] !== null ? objectINfo[key] : objectINfo[key] = 0 })
                    //         let value = foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0
                    //         openOrderInfos[0].swap = openOrderInfos[0].swap + value
                    //         openOrderInfos[0].total = openOrderInfos[0].total + value
                    //     }
                    // }
                    for (let openOrderItem of openOrderInfos) {
                        totalOfToHistoryOrder += (openOrderItem.commission + openOrderItem.taxes + openOrderItem.swap + openOrderItem.profit);
                    }
                    openOrderToInfo = openOrderInfos;
                }
            }
            return res.status(200).json({
                rows: filteredInfo,
                fromHistoryOrderInfo: openOrderFromInfo,
                toHistoryOrderInfo: openOrderToInfo,
                customSwapTable: customSwapTable,
                totalOfHistoryOrder: totalOfFromHistoryOrder + totalOfToHistoryOrder
            });
        }
        return res.status(200).json({ rows: [], fromHistoryOrderInfo: [], toHistoryOrderInfo: [], commissionHistoryOrderInfo: [] });
    } catch (err) {
        return res.status(err.status || 500).json(err);
    };
}


const calculatingCommission = async (req, res, next) => {
    try {
        let filteredInfo = await filteredProfileModel.findOne({
            where: { status: 1 },
            raw: true
        });
        let commission_acount_id = filteredInfo.commission_acount_id
        let historyOrderData = await historyOrderModel.findAll({
            where: { account_id : commission_acount_id, order_type : 6 },
            attributes: { exclude: ['id'] },
            raw: true,
        })
        let accountTableDetails = await accountsDetailModel.findAll({
            where: { account_id : commission_acount_id },
            attributes: { exclude: ['id'] },
            raw: true
        });
        let totalProfit = 0
        let profit = historyOrderData.map(data =>  data.profit)
        totalProfit = profit.reduce((a, b) => a + b, 0)
        let equity = accountTableDetails.map(data => data.equity)
        let commission = totalProfit - equity
        return res.status(200).json({
            commission_acount_id:commission_acount_id,
            equity: equity,
            totalProfit: totalProfit,
            commission : commission
        })
    }
    catch(err){
        return res.status(err.status || 500).json(err);
    }
}


module.exports = {
    calculatingOpenTrade,
    calculatingHistoryTrade,
    calculatingCommission,
};