const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../models");
const symbolModel = models.symbol;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order;
const accountsDetailModel = models.accounts_detail;


const openTrade = async (
  {
    fromAccountId,
    fromsymbols,
    startdateFrom,
    enddateFrom,
    frommagicAccount,
    from_include_exclude,
    CustomSwap,
    toAccountId,
    tosymbols,
    startdateTo,
    enddateTo,
    tomagicAccount,
    to_include_exclude,
    totalOfFromOpenOrder,
    totalOfToOpenOrder,
    openOrderFromInfo,
    openOrderToInfo,
  },
  fromRequest
) => {
  //Check Include Exclude Status And Symbols For Account "From"
  if (from_include_exclude != 0) {
    let AllWhereConditions = {};

    if (from_include_exclude === 2) {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.notIn]: frommagicAccount,
        },
        symbol: {
          [Op.in]: fromsymbols,
        },
        open_time: {
          [Op.gte]: startdateFrom,
          [Op.lt]: enddateFrom,
        },
      };
    } else {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.in]: frommagicAccount,
        },
        symbol: {
          [Op.in]: fromsymbols,
        },
        open_time: {
          [Op.gte]: startdateFrom,
          [Op.lt]: enddateFrom,
        },
      };
    }
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await openOrderModel.findAll({
        attributes: [
          "order_type",
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],
        where: AllWhereConditions,
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await openOrderModel.findAll({
        where: AllWhereConditions,
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }
    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === fromAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].open_value !== 0 &&
        foundRec[0].open_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];

        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderFromInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfFromOpenOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderFromInfo = openOrderInfos;

        let symbol = openOrderFromInfo.map((item) => item.symbol);
        
        let symbolInfo = await symbolModel.findAll({
          where: { name: symbol },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.contract_size = symbolInfo[0].contract_size;
          
          return item;
        });
        //
        let currency = openOrderFromInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        console.log(currencyInfo, " --------------------->")
        openOrderFromInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });

      }
    }
  } else if (fromsymbols && fromsymbols.length > 0) {
    let openOrderInfos;

    if (fromRequest == "account") {
      openOrderInfos = await openOrderModel.findAll({
        attributes: [
          "order_type",
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+swap)"), "total"],
        ],
        where: {
          account_id: fromAccountId,
          symbol: {
            [Op.in]: fromsymbols,
          },
          open_time: {
            [Op.gte]: startdateFrom,
            [Op.lt]: enddateFrom,
          },
        },
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await openOrderModel.findAll({
        where: {
          account_id: fromAccountId,
          symbol: {
            [Op.in]: fromsymbols,
          },
          open_time: {
            [Op.gte]: startdateFrom,
            [Op.lt]: enddateFrom,
          },
        },
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }

    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === fromAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].open_value !== 0 &&
        foundRec[0].open_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];
        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderFromInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfFromOpenOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderFromInfo = openOrderInfos;
        let symbol = openOrderFromInfo.map((item) => item.symbol);

        let symbolInfo = await symbolModel.findAll({
          where: { name: symbol },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.contract_size = symbolInfo[0].contract_size;
          return item;
        });

        // let currency = openOrderFromInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        console.log(currencyInfo, " --------------------->")
        openOrderFromInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
      }
    }
  }

  //Check Include Exclude Status And Symbols For Account "To"
  if (to_include_exclude !== 0) {
    let AllWhereConditions = {};

    if (to_include_exclude === 2) {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.notIn]: tomagicAccount,
        },
        symbol: {
          [Op.in]: tosymbols,
        },
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      };
    } else {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.in]: tomagicAccount,
        },
        symbol: {
          [Op.in]: tosymbols,
        },
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      };
    }
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await openOrderModel.findAll({
        attributes: [
          "order_type",
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],
        where: AllWhereConditions,
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await openOrderModel.findAll({
        where: AllWhereConditions,
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }
    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === toAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].open_value !== 0 &&
        foundRec[0].open_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];

        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderToInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfToOpenOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderToInfo = openOrderInfos;
        let symbolTo = openOrderToInfo.map((item) => item.symbol);

        let symbolINfoTo = await symbolModel.findAll({
          where: { name: symbolTo },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.contract_size = symbolINfoTo[0].contract_size;
      
          return item;
        });

        //
        let currency = openOrderToInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
      }
    }
  } else if (tosymbols && tosymbols.length > 0) {
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await openOrderModel.findAll({
        attributes: [
          "order_type",
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+swap)"), "total"],
        ],
        where: {
          account_id: toAccountId,
          symbol: {
            [Op.in]: tosymbols,
          },
          open_time: {
            [Op.gte]: startdateTo,
            [Op.lt]: enddateTo,
          },
        },
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await openOrderModel.findAll({
        where: {
          account_id: toAccountId,
          symbol: {
            [Op.in]: tosymbols,
          },
          open_time: {
            [Op.gte]: startdateTo,
            [Op.lt]: enddateTo,
          },
        },
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }

    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === toAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].open_value !== 0 &&
        foundRec[0].open_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];
        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].open_value : 0;

        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderToInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfToOpenOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderToInfo = openOrderInfos;
        let symbolTo = openOrderToInfo.map((item) => item.symbol);

        let symbolINfoTo = await symbolModel.findAll({
          where: { name: symbolTo },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.contract_size = symbolINfoTo[0].contract_size;
          item.margin_currency = symbolINfoTo[0].margin_currency;
          return item;
        });
        //
        let currency = openOrderToInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
        
      }
    }
  }
  if (fromRequest == "account") {
    return (response = {
      openOrderToInfo: openOrderToInfo.length > 0 ? openOrderToInfo : [],
      openOrderFromInfo: openOrderFromInfo.length > 0 ? openOrderFromInfo : [],
    });
  } else if (fromRequest == "whatAmCalculating") {
    return (response = {
      openOrderFromInfo: openOrderFromInfo.length > 0 ? openOrderFromInfo : [],
      openOrderToInfo: openOrderToInfo.length > 0 ? openOrderToInfo : [],
      totalOfOpenOrder: totalOfFromOpenOrder + totalOfToOpenOrder,
    });
  }
};

const commonHistory = async (
  {
    fromAccountId,
    fromsymbols,
    frommagicAccount,
    from_include_exclude,
    startdateFrom,
    enddateFrom,
    toAccountId,
    tosymbols,
    tomagicAccount,
    to_include_exclude,
    startdateTo,
    enddateTo,
    CustomSwap,
    openOrderFromInfo,
    openOrderToInfo,
    totalOfFromHistoryOrder,
    totalOfToHistoryOrder,
  },
  fromRequest
) => {
  //Check Include Exclude Status And Symbols For Account "From"
  if (from_include_exclude !== 0) {
    let AllWhereConditions = {};
    if (from_include_exclude === 2) {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.notIn]: frommagicAccount,
        },
        symbol: {
          [Op.in]: fromsymbols,
        },
        open_time: {
          [Op.gte]: startdateFrom,
          [Op.lt]: enddateFrom,
        },
      };
    } else {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.in]: frommagicAccount,
        },
        symbol: {
          [Op.in]: fromsymbols,
        },
        open_time: {
          [Op.gte]: startdateFrom,
          [Op.lt]: enddateFrom,
        },
      };
    }
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await historyOrderModel.findAll({
        attributes: [
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],
        where: AllWhereConditions,
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await historyOrderModel.findAll({
        where: AllWhereConditions,
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }

    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === fromAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].close_value !== 0 &&
        foundRec[0].close_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];

        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderFromInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfFromHistoryOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderFromInfo = openOrderInfos;
        let symbol = openOrderFromInfo.map((item) => item.symbol);
        let symbolInfo = await symbolModel.findAll({
          where: { name: symbol },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.contract_size = symbolInfo[0].contract_size;
          return item;
        });

        //
        let currency = openOrderFromInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
      }
    }
  } else if (fromsymbols && fromsymbols.length > 0) {
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await historyOrderModel.findAll({
        attributes: [
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],
        where: {
          account_id: fromAccountId,
          symbol: {
            [Op.in]: fromsymbols,
          },

          open_time: {
            [Op.gte]: startdateFrom,
            [Op.lt]: enddateFrom,
          },
        },
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await historyOrderModel.findAll({
        where: {
          account_id: fromAccountId,
          symbol: {
            [Op.in]: fromsymbols,
          },

          open_time: {
            [Op.gte]: startdateFrom,
            [Op.lt]: enddateFrom,
          },
        },
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }
    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === fromAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].close_value !== 0 &&
        foundRec[0].close_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];

        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderFromInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfFromHistoryOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderFromInfo = openOrderInfos;
        let symbol = openOrderFromInfo.map((item) => item.symbol);
        let symbolInfo = await symbolModel.findAll({
          where: { name: symbol },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.contract_size = symbolInfo[0].contract_size;
          return item;
        });

        let currency = openOrderFromInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        openOrderFromInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
      }
    }
  }

  //Check Include Exclude Status And Symbols For Account "To"
  if (to_include_exclude !== 0) {
    let AllWhereConditions = {};

    if (to_include_exclude === 2) {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.in]: tomagicAccount,
        },
        symbol: {
          [Op.in]: tosymbols,
        },
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      };
    } else {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.in]: tomagicAccount,
        },
        symbol: {
          [Op.in]: tosymbols,
        },
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      };
    }

    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await historyOrderModel.findAll({
        attributes: [
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],
        where: AllWhereConditions,
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await historyOrderModel.findAll({
        where: AllWhereConditions,
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }
    if (openOrderInfos && openOrderInfos.length > 0) {
      let foundRec = CustomSwap.filter((data) => {
        return data.account_id === toAccountId;
      });

      if (
        openOrderInfos[0].swap !== null &&
        foundRec.length > 0 &&
        foundRec[0].close_value !== 0 &&
        foundRec[0].close_value !== undefined
      ) {
        let objectINfo = openOrderInfos[0];

        Object.keys(objectINfo).forEach((key) => {
          objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
        });
        let value =
          foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0;
        openOrderInfos[0].swap = openOrderInfos[0].swap + value;
        openOrderInfos[0].total = openOrderInfos[0].total + value;
      }
      if (fromRequest == "account") {
        openOrderToInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfToHistoryOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderToInfo = openOrderInfos;
        let symbolTo = openOrderToInfo.map((item) => item.symbol);
        let symbolINfoTo = await symbolModel.findAll({
          where: { name: symbolTo },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.contract_size = symbolINfoTo[0].contract_size;
          return item;
        });
        //
        let currency = openOrderToInfo.map((item) => item.account_id);
        let currencyInfo = await accountsDetailModel.findAll({
          where: { account_id: currency },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.margin_currency = currencyInfo[0].currency;

          return item;
        });
      }
    }
  } else if (tosymbols && tosymbols.length > 0) {
    let openOrderInfos;
    if (fromRequest == "account") {
      openOrderInfos = await historyOrderModel.findAll({
        attributes: [
          [Sequelize.literal("SUM(swap)"), "swap"],
          [Sequelize.literal("SUM(taxes)"), "taxes"],
          [Sequelize.literal("SUM(commission)"), "commission"],
          [Sequelize.literal("SUM(lots)"), "lots"],
          [Sequelize.literal("SUM(profit)"), "profit"],
          [Sequelize.literal("SUM(profit+commission+taxes+swap)"), "total"],
        ],

        where: {
          account_id: toAccountId,
          symbol: {
            [Op.in]: tosymbols,
          },
          open_time: {
            [Op.gte]: startdateTo,
            [Op.lt]: enddateTo,
          },
        },
        raw: true,
      });
    } else if (fromRequest == "whatAmCalculating") {
      openOrderInfos = await historyOrderModel.findAll({
        where: {
          account_id: toAccountId,
          symbol: {
            [Op.in]: tosymbols,
          },
          open_time: {
            [Op.gte]: startdateTo,
            [Op.lt]: enddateTo,
          },
        },
        order: [["open_time", "DESC"]],
        raw: true,
      });
    }

    if (openOrderInfos && openOrderInfos.length > 0) {
      if (openOrderInfos !== null) {
        let foundRec = CustomSwap.filter((data) => {
          return data.account_id === toAccountId;
        });

        if (
          openOrderInfos[0].swap !== null &&
          foundRec.length > 0 &&
          foundRec[0].close_value !== 0 &&
          foundRec[0].close_value !== undefined
        ) {
          let objectINfo = openOrderInfos[0];
          Object.keys(objectINfo).forEach((key) => {
            objectINfo[key] !== null ? objectINfo[key] : (objectINfo[key] = 0);
          });
          let value =
            foundRec && foundRec.length > 0 ? foundRec[0].close_value : 0;
          openOrderInfos[0].swap = openOrderInfos[0].swap + value;
          openOrderInfos[0].total = openOrderInfos[0].total + value;
        }
      }
      if (fromRequest == "account") {
        openOrderToInfo = openOrderInfos;
      } else if (fromRequest == "whatAmCalculating") {
        for (let openOrderItem of openOrderInfos) {
          totalOfToHistoryOrder +=
            openOrderItem.commission +
            openOrderItem.taxes +
            openOrderItem.swap +
            openOrderItem.profit;
        }
        openOrderToInfo = openOrderInfos;
        let symbolTo = openOrderToInfo.map((item) => item.symbol);
        let symbolINfoTo = await symbolModel.findAll({
          where: { name: symbolTo },
          raw: true,
        });
        openOrderToInfo.map((item) => {
          item.contract_size = symbolINfoTo[0].contract_size;
          item.margin_currency = symbolINfoTo[0].margin_currency;
          return item;
        });
      //
      let currency = openOrderToInfo.map((item) => item.account_id);
      let currencyInfo = await accountsDetailModel.findAll({
        where: { account_id: currency },
        raw: true,
      });
      openOrderToInfo.map((item) => {
        item.margin_currency = currencyInfo[0].currency;

        return item;
      });
      }
    }
  }
  if (fromRequest == "account") {
    return (response = {
      openOrderToInfo: openOrderToInfo.length > 0 ? openOrderToInfo : [],
      openOrderFromInfo: openOrderFromInfo.length > 0 ? openOrderFromInfo : [],
    });
  } else if (fromRequest == "whatAmCalculating") {
    return (response = {
      openOrderFromInfo: openOrderFromInfo.length > 0 ? openOrderFromInfo : [],
      openOrderToInfo: openOrderToInfo.length > 0 ? openOrderToInfo : [],
      totalOfHistoryOrder: totalOfFromHistoryOrder + totalOfToHistoryOrder,
    });
  }
};

const statusData = async ({
  fromSymbolInfo,
  toSymbolInfo,
  fromOpenOrderInfos,
  toOpenOrderInfos,
  fromAccountInfo,
  toAccountInfo,
  fromsymbols,
  toAccountId,
  fromAccountId,
  tosymbols,
  tomagicAccount,
  frommagicAccount,
  to_include_exclude,
  from_include_exclude,
  startdateFrom,
  enddateFrom,
  startdateTo,
  enddateTo,
}) => {
  //Check Include Exclude Status And Symbols For Account "From"
  let fromNumb;
  let toNumb;
  if (from_include_exclude != 0) {
    let forIncludeExclude;
    if (from_include_exclude == 2) {
      forIncludeExclude = {
        [Op.notIn]: frommagicAccount,
      };
    } else {
      forIncludeExclude = {
        [Op.in]: frommagicAccount,
      };
    }
    fromNumb = await openOrderModel.findAll({
      attributes: [
        "order_type",
        [Sequelize.literal("SUM(lots)"), "lots"],
        "symbol",
      ],
      where: {
        account_id: fromAccountId,
        magic_number: forIncludeExclude,
        symbol: {
          [Op.in]: fromsymbols,
        },
        open_time: {
          [Op.gte]: startdateFrom,
          [Op.lt]: enddateFrom,
        },
      },
      group: "symbol",
      limit: 1,
      raw: true,
    });

    fromSymbolInfo = await symbolModel.findAll({
      where: {
        name: fromNumb[0].symbol,
        login: fromAccountInfo.login,
      },
      raw: true,
    });
  } else {
    toOpenOrderInfos = await openOrderModel.findAll({
      attributes: ["order_type", [Sequelize.literal("SUM(lots)"), "lots"]],
      where: {
        account_id: fromAccountInfo.id,
        symbol: fromsymbols[0],
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      },
      raw: true,
    });
    fromSymbolInfo = await symbolModel.findAll({
      where: { name: fromsymbols[0], login: fromAccountInfo.login },
      raw: true,
    });
  }
  //Check Include Exclude Status And Symbols For Account "To"
  if (to_include_exclude != 0) {
    let forIncludeExclude;

    if (to_include_exclude == 2) {
      forIncludeExclude = {
        [Op.notIn]: tomagicAccount,
      };
    } else {
      forIncludeExclude = {
        [Op.in]: tomagicAccount,
      };
    }
    toNumb = await openOrderModel.findAll({
      attributes: [
        "order_type",
        [Sequelize.literal("SUM(lots)"), "lots"],
        "symbol",
      ],
      where: {
        account_id: toAccountId,
        magic_number: forIncludeExclude,
        symbol: {
          [Op.in]: tosymbols,
        },
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      },
      group: "symbol",
      limit: 1,
      raw: true,
    });
    toSymbolInfo = await symbolModel.findAll({
      where: {
        name: toNumb[0].symbol,
        login: toAccountInfo.login,
      },
      raw: true,
    });
  } else {
    toOpenOrderInfos = await openOrderModel.findAll({
      attributes: ["order_type", [Sequelize.literal("SUM(lots)"), "lots"]],
      where: {
        account_id: toAccountInfo.id,
        symbol: tosymbols[0],
        open_time: {
          [Op.gte]: startdateTo,
          [Op.lt]: enddateTo,
        },
      },
      raw: true,
    });
    toSymbolInfo = await symbolModel.findAll({
      where: { name: tosymbols[0], login: toAccountInfo.login },
      raw: true,
    });
  }
  return (response = {
    fromAccountInfo: fromAccountInfo,
    fromSymbolInfo: fromSymbolInfo.length > 0 ? fromSymbolInfo[0] : {},
    toAccountInfo: toAccountInfo,
    toSymbolInfo: toSymbolInfo.length > 0 ? toSymbolInfo[0] : {},
    fromOpenOrderInfos:
      fromNumb !== undefined && fromNumb.length > 0 ? fromNumb : [],
    toOpenOrderInfos: toNumb !== undefined && toNumb.length > 0 ? toNumb : [],
  });
};

module.exports = {
  openTrade,
  commonHistory,
  statusData,
};
