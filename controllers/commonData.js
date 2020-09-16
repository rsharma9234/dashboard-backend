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
    // startdateFrom,
    // enddateFrom,
    frommagicAccount,
    from_include_exclude,
    CustomSwap,
    toAccountId,
    tosymbols,
    // startdateTo,
    // enddateTo,
    tomagicAccount,
    to_include_exclude,
    fromticket,
    toticket,
    from_include_exclude_ticket,
    to_include_exclude_ticket,
    totalOfFromOpenOrder,
    totalOfToOpenOrder,
    openOrderFromInfo,
    openOrderToInfo,
  },
  fromRequest
) => {
  let AllWhereConditions = {};
  //Check Include Exclude Status And Symbols For Account "From"
  if (from_include_exclude !== 0) {
    if (from_include_exclude === 2) {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.notIn]: frommagicAccount,
        },
        // ticket: {
        //   [Op.notIn]: fromticket,
        // },
        symbol: {
          [Op.in]: fromsymbols,
        },
        // open_time: {
        //   [Op.gte]: startdateFrom,
        //   [Op.lt]: enddateFrom,
        // },
      };
    } else {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.in]: frommagicAccount,
        },
        // ticket: {
        //   [Op.in]: fromticket,
        // },
        symbol: {
          [Op.in]: fromsymbols,
        },
        // open_time: {
        //   [Op.gte]: startdateFrom,
        //   [Op.lt]: enddateFrom,
        // },
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
      if (fromticket.length > 0) {
        if (from_include_exclude_ticket === 2) {
          openOrderInfos = await openOrderInfos.filter((data) => {
            return !fromticket.includes(String(data.ticket));
          });
        } else if (from_include_exclude_ticket === 1) {
          openOrderInfos = await openOrderInfos.filter((data) => {
            return fromticket.includes(String(data.ticket));
          });
        }
      }
      if (
        openOrderInfos.length &&
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
          limit: 1,
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
        // console.log(currencyInfo, " --------------------->");
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
          // open_time: {
          //   [Op.gte]: startdateFrom,
          //   [Op.lt]: enddateFrom,
          // },
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
          // open_time: {
          //   [Op.gte]: startdateFrom,
          //   [Op.lt]: enddateFrom,
          // },
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
        openOrderInfos.length &&
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
          limit: 1,
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
  // let AllWhereConditions = {};
  if (to_include_exclude !== 0) {
    if (to_include_exclude === 2) {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.notIn]: tomagicAccount,
        },
        // ticket: {
        //   [Op.notIn]: toticket,
        // },
        symbol: {
          [Op.in]: tosymbols,
        },
        // open_time: {
        //   [Op.gte]: startdateTo,
        //   [Op.lt]: enddateTo,
        // },
      };
    } else {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.in]: tomagicAccount,
        },
        // ticket: {
        //   [Op.in]: toticket,
        // },
        symbol: {
          [Op.in]: tosymbols,
        },
        // open_time: {
        //   [Op.gte]: startdateTo,
        //   [Op.lt]: enddateTo,
        // },
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
      if (to_include_exclude_ticket === 2) {
        openOrderInfos = await openOrderInfos.filter((data) => {
          return !toticket.includes(String(data.ticket));
        });
      } else if (to_include_exclude_ticket === 1) {
        openOrderInfos = await openOrderInfos.filter((data) => {
          return toticket.includes(String(data.ticket));
        });
      }
      // console.log(openOrderInfos, "gfhgdsjh..........");
      if (
        openOrderInfos.length &&
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
          limit: 1,
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
          fromticket,
          toticket,
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
          // open_time: {
          //   [Op.gte]: startdateTo,
          //   [Op.lt]: enddateTo,
          // },
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
          // open_time: {
          //   [Op.gte]: startdateTo,
          //   [Op.lt]: enddateTo,
          // },
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
        openOrderInfos.length &&
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
          limit: 1,
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
    // console.log(openOrderToInfo,openOrderFromInfo, '============================<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );

    return (response = {
      openOrderToInfo:
        openOrderToInfo && openOrderToInfo.length > 0 ? openOrderToInfo : [],
      openOrderFromInfo:
        openOrderFromInfo && openOrderFromInfo.length > 0
          ? openOrderFromInfo
          : [],
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
    fromticket,
    toticket,
    from_include_exclude_ticket,
    to_include_exclude_ticket,
  },
  fromRequest
) => {
  let AllWhereConditions = {};
  //Check Include Exclude Status And Symbols For Account "From"
  if (from_include_exclude !== 0) {
    if (from_include_exclude === 2) {
      AllWhereConditions = {
        account_id: fromAccountId,
        magic_number: {
          [Op.notIn]: frommagicAccount,
        },
        // ticket: {
        //   [Op.notIn]: fromticket,
        // },
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
        // ticket: {
        //   [Op.in]: fromticket,
        // },
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
      if (fromticket.length > 0) {
        if (from_include_exclude_ticket === 2) {
          openOrderInfos = await openOrderInfos.filter((data) => {
            return !fromticket.includes(String(data.ticket));
          });
        } else if (from_include_exclude_ticket === 1) {
          openOrderInfos = await openOrderInfos.filter((data) => {
            return fromticket.includes(String(data.ticket));
          });
        }
      }
      if (
        openOrderInfos.length &&
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
          limit: 1,
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
        openOrderInfos.length &&
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
          limit: 1,
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
    // let AllWhereConditions = {};

    if (to_include_exclude === 2) {
      AllWhereConditions = {
        account_id: toAccountId,
        magic_number: {
          [Op.notIn]: tomagicAccount,
        },
        // ticket: {
        //   [Op.notIn]: toticket,
        // },
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
        // ticket: {
        //   [Op.in]: toticket,
        // },
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
      if (to_include_exclude_ticket === 2) {
        openOrderInfos = await openOrderInfos.filter((data) => {
          return !toticket.includes(String(data.ticket));
        });
      } else if (to_include_exclude_ticket === 1) {
        openOrderInfos = await openOrderInfos.filter((data) => {
          return toticket.includes(String(data.ticket));
        });
      }
      if (
        openOrderInfos.length &&
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
          limit: 1,
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
          openOrderInfos.length &&
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
          limit: 1,
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
    // console.log(openOrderToInfo.length,openOrderFromInfo.length, '============================<<<<<<<<<<<<<<<<<<<<<<<<<<<<' );
    return (response = {
      openOrderToInfo:
        openOrderToInfo && openOrderToInfo.length > 0 ? openOrderToInfo : [],
      openOrderFromInfo:
        openOrderFromInfo && openOrderFromInfo.length > 0
          ? openOrderFromInfo
          : [],
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
  fromticket,
  toticket,
  from_include_exclude_ticket,
  to_include_exclude_ticket,
}) => {
  let forIncludeExclude;
  //Check Include Exclude Status And Symbols For Account "From"
  if (from_include_exclude !== 0) {
    if (from_include_exclude === 2) {
      forIncludeExclude = {
        [Op.notIn]: frommagicAccount,
      };
    } else {
      forIncludeExclude = {
        [Op.in]: frommagicAccount,
      };
    }
    console.log(new Date(), "1----------->");
    fromOpenOrderInfos = await openOrderModel.findAll({
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
    console.log(fromOpenOrderInfos, "11==========>");

    console.log(new Date(), "fs1----------->");
    if (fromOpenOrderInfos && fromOpenOrderInfos.length > 0) {
      if (fromticket.length > 0) {
        if (from_include_exclude_ticket === 2) {
          fromOpenOrderInfos = await fromOpenOrderInfos.filter((data) => {
            return !fromticket.includes(String(data.ticket));
          });
        } else if (from_include_exclude_ticket === 1) {
          fromOpenOrderInfos = await fromOpenOrderInfos.filter((data) => {
            return fromticket.includes(String(data.ticket));
          });
        }
      }
      fromSymbolInfo = await symbolModel.findAll({
        where: {
          name: fromOpenOrderInfos[0].symbol,
          login: fromAccountInfo.login,
        },
        limit: 1,
        raw: true,
      });
    }
    console.log(new Date(), "fs2----------->");
  } else {
    console.log(new Date(), "2----------->");
    fromOpenOrderInfos = await openOrderModel.findAll({
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
    console.log(fromOpenOrderInfos, "22==========>");

    console.log(new Date(), "fs3----------->");
    if (fromOpenOrderInfos && fromOpenOrderInfos.length > 0) {
      fromSymbolInfo = await symbolModel.findAll({
        where: { name: fromsymbols[0], login: fromAccountInfo.login },
        limit: 1,
        raw: true,
      });
    }
    console.log(new Date(), "fs4----------->");
  }
  //Check Include Exclude Status And Symbols For Account "To"
  if (to_include_exclude !== 0) {
    // let forIncludeExclude;
    // let forIncludeExcludeticket;
    if (to_include_exclude === 2) {
      forIncludeExclude = {
        [Op.notIn]: tomagicAccount,
      };
    } else {
      forIncludeExclude = {
        [Op.in]: tomagicAccount,
      };
    }
    console.log(new Date(), "3----------->");
    toOpenOrderInfos = await openOrderModel.findAll({
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
    console.log(toOpenOrderInfos, "33==========>");
    console.log(new Date(), "ts1----------->");
    if (toOpenOrderInfos && toOpenOrderInfos.length > 0) {
      if (toticket.length > 0) {
        if (to_include_exclude_ticket === 2) {
          toOpenOrderInfos = await toOpenOrderInfos.filter((data) => {
            return !toticket.includes(String(data.ticket));
          });
        } else if (to_include_exclude_ticket === 1) {
          toOpenOrderInfos = await toOpenOrderInfos.filter((data) => {
            return toticket.includes(String(data.ticket));
          });
        }
      }
      toSymbolInfo = await symbolModel.findAll({
        where: {
          name: toOpenOrderInfos[0].symbol,
          login: toAccountInfo.login,
        },
        limit: 1,
        raw: true,
      });
    }
    console.log(new Date(), "ts2----------->");
  } else {
    console.log(new Date(), "4----------->");
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
    console.log(toOpenOrderInfos, "44==========>");
    console.log(new Date(), "ts3----------->");
    if (toOpenOrderInfos && toOpenOrderInfos.length > 0) {
      toSymbolInfo = await symbolModel.findAll({
        where: { name: tosymbols[0], login: toAccountInfo.login },
        limit: 1,
        raw: true,
      });
    }
    console.log(new Date(), "ts4----------->");
  }
  return (response = {
    fromAccountInfo: fromAccountInfo,
    fromSymbolInfo: fromSymbolInfo.length > 0 ? fromSymbolInfo[0] : {},
    toAccountInfo: toAccountInfo,
    toSymbolInfo: toSymbolInfo.length > 0 ? toSymbolInfo[0] : {},
    fromOpenOrderInfos:
      fromOpenOrderInfos !== undefined && fromOpenOrderInfos.length > 0
        ? fromOpenOrderInfos
        : [],
    toOpenOrderInfos:
      toOpenOrderInfos !== undefined && toOpenOrderInfos.length > 0
        ? toOpenOrderInfos
        : [],
  });
};

module.exports = {
  openTrade,
  commonHistory,
  statusData,
};
