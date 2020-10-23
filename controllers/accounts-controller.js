"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../models");
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const symbolModel = models.symbol;
const historyOrderModel = models.history_order;
``;
const filteredProfileModel = models.filtered_profile;
const CustomSwapModel = models.custom_swap;
const CustomDeposite = models.custom_deposite;
const moment = require("moment");
const common = require("./commonData");

const fetchAllAccounts = async (req, res, next) => {
  try {
    let accountInfo = await accountModel.findAll({
      where: { launched: 1 },
      attributes: ["id", "login"],
      include: [accountsDetailModel],
    });

    if (accountInfo && accountInfo.length > 0) {
      accountInfo.map((data) => data.toJSON());
      return res.status(200).json({ rows: accountInfo });
    }
    return res.status(200).json({ rows: [] });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchAllSymbol = async (req, res, next) => {
  try {
    let symbolInfo = await symbolModel.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("name")), "name"]],
    });
    return res.status(200).json({ rows: symbolInfo });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

//open postions data goes here
const fetchAllOpenTrade = async (req, res, next) => {
  try {
    // Get Filter Profile Data Using Status 1
    let status = {};
    if (req.userdata) {
      status = {
        user_status: 1,
      };
    } else {
      status = {
        status: 1,
      };
    }
    let filteredInfo = await filteredProfileModel.findOne({
      where: status,
      raw: true,
    });

    // Get Account Detail
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });

    if (filteredInfo != null) {
      //Account "From" Detail
      let fromAccountId = filteredInfo.from_account_id;
      let fromsymbols = JSON.parse(filteredInfo.from_symbols);
      // let startdateFrom = filteredInfo.startdateFrom;
      // let enddateFrom =
      //   filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == ""
      //     ? new Date()
      //     : filteredInfo.enddateFrom;

      let frommagicAccount =
        filteredInfo.from_magic_number != "" &&
        filteredInfo.from_magic_number != null &&
        JSON.parse(filteredInfo.from_magic_number);
      let from_include_exclude = filteredInfo.from_include_exclude_status;
      let fromticket =
        filteredInfo.from_ticket != "" &&
        filteredInfo.from_ticket != null &&
        JSON.parse(filteredInfo.from_ticket);
      let from_include_exclude_ticket =
        filteredInfo.from_include_exclude_status_ticket;

      //Account "To" Detail
      let toAccountId = filteredInfo.to_account_id;
      let tosymbols = JSON.parse(filteredInfo.to_symbols);
      // let startdateTo = filteredInfo.startdateTo;
      // let enddateTo =
      //   filteredInfo.enddateTo == null || filteredInfo.enddateTo == ""
      //     ? new Date()
      //     : filteredInfo.enddateTo;

      let tomagicAccount =
        filteredInfo.to_magic_number != "" &&
        filteredInfo.to_magic_number != null &&
        JSON.parse(filteredInfo.to_magic_number);
      let to_include_exclude = filteredInfo.to_include_exclude_status;
      let toticket =
        filteredInfo.to_ticket != "" &&
        filteredInfo.to_ticket != null &&
        JSON.parse(filteredInfo.to_ticket);
      let to_include_exclude_ticket =
        filteredInfo.to_include_exclude_status_ticket;

      let newRecord = accountInfo.filter((rec) => rec.id == fromAccountId);
      let newToRecord = accountInfo.filter((rec) => rec.id == toAccountId);

      filteredInfo.accountFromInfo = newRecord;
      filteredInfo.accountToInfo = newToRecord;

      let CustomSwap = await CustomSwapModel.findAll({
        attributes: ["account_id", "open_value"],
        where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
        raw: true,
      });
      //Function from commonData file
      let commonData;
      let paramsNewObj = {
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
      };
      await common
        .openTrade(
          paramsNewObj,
          "account"
        )
        .then((res) => {
          commonData = res;
          // console.log(commonData,'account123');
        })
        .catch((err) => {
          console.log(err);
        });

      //Send Api Response
      return res.status(200).json({
        rows: filteredInfo,
        fromOpenOrderInfo:
          commonData !== undefined ? commonData.openOrderFromInfo : [],
        toOpenOrderInfo:
          commonData !== undefined ? commonData.openOrderToInfo : [],
      });
    }
    return res.status(200).json({
      rows: [],
      OpenOrder: [],
      fromOpenOrderInfo: [],
      toOpenOrderInfo: [],
    });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchLastUpdatedTime = async (req, res, next) => {
  try {
    // Get Filter Profile Data Using Status 1
    let status = {};
    if (req.userdata) {
      status = {
        user_status: 1,
      };
    } else {
      status = {
        status: 1,
      };
    }
    let filteredInfo = await filteredProfileModel.findOne({
      where: status,
      raw: true,
    });

    // Get Last Seen From Account Detail Model
    if (filteredInfo != null) {
      let fromAccountId = filteredInfo.from_account_id;
      let toAccountId = filteredInfo.to_account_id;

      let lastUpdated = await accountsDetailModel.findAll({
        attributes: ["last_seen"],
        where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
        raw: true,
      });

      let moments = lastUpdated.map((data) => moment(data.last_seen));
      let maxDate = moment.min(moments);
      let date = moment(maxDate).utc().format("DD-MM-YYYY  HH:mm:ss");

      return res.status(200).json({ filteredInfoTime: date });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
// close position data goes here
const fetchAllHistoryTrade = async (req, res, next) => {
  try {
    // Get Filter Profile Data Using Status 1
    let status = {};
    if (req.userdata) {
      status = {
        user_status: 1,
      };
    } else {
      status = {
        status: 1,
      };
    }
    let filteredInfo = await filteredProfileModel.findOne({
      where: status,
      raw: true,
    });

    // Get Account Detail
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });

    let commission_acount_id = filteredInfo.commission_acount_id;
    let startdateComm = filteredInfo.startdateComm;
    let enddateComm =
      filteredInfo.enddateComm == null || filteredInfo.enddateComm == ""
        ? new Date()
        : filteredInfo.enddateComm;
    let comm_magic_number = filteredInfo.comm_magic_number != "" &&
      filteredInfo.comm_magic_number != null &&
      JSON.parse(filteredInfo.comm_magic_number);
    // Calculate Profit According To Order Type
    let forIncludeExclude;
    let historyOrderInfo = [];
    if (filteredInfo.comm_include_exclude_status !== 0) {
      if (filteredInfo.comm_include_exclude_status === 2) {
        forIncludeExclude = {
          [Op.notIn]: comm_magic_number,
        };
      } else {
        forIncludeExclude = {
          [Op.in]: comm_magic_number,
        };
      }
    historyOrderInfo = await historyOrderModel.findAll({
      attributes: [
        [Sequelize.literal("SUM(profit)"), "profit"], // coming null
      ],
      where: {
         order_type: 6, 
         account_id: commission_acount_id,
         magic_number: forIncludeExclude,
         open_time: {
           [Op.gte]: startdateComm,
           [Op.lt]: enddateComm,
         },
       },
      raw: true,
    });
  }else{
    historyOrderInfo = await historyOrderModel.findAll({
      attributes: [
        [Sequelize.literal("SUM(profit)"), "profit"], // coming null
      ],
      where: {
         order_type: 6, 
         account_id: commission_acount_id,
         open_time: {
           [Op.gte]: startdateComm,
           [Op.lt]: enddateComm,
         },
       },
      raw: true,
    });
  }

    let customSwapTable = await CustomSwapModel.findAll({
      attributes: { exclude: ["id"] },
      raw: true,
    });

    if (filteredInfo != null) {
      let history_info = 0;

      //Account "From" Detail
      let fromAccountId = filteredInfo.from_account_id;
      let fromsymbols = JSON.parse(filteredInfo.from_symbols);

      let frommagicAccount =
        filteredInfo.from_magic_number != "" &&
        filteredInfo.from_magic_number != null &&
        JSON.parse(filteredInfo.from_magic_number);
      let fromticket =
        filteredInfo.from_ticket != "" &&
        filteredInfo.from_ticket != null &&
        JSON.parse(filteredInfo.from_ticket);
      let from_include_exclude = filteredInfo.from_include_exclude_status;
      let from_include_exclude_ticket =
        filteredInfo.from_include_exclude_status_ticket;

      let startdateFrom = filteredInfo.startdateFrom;
      let enddateFrom =
        filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == ""
          ? new Date()
          : filteredInfo.enddateFrom;

      //Account "To" Detail
      let toAccountId = filteredInfo.to_account_id;
      let tosymbols = JSON.parse(filteredInfo.to_symbols);

      let tomagicAccount =
        filteredInfo.to_magic_number != "" &&
        filteredInfo.to_magic_number != null &&
        JSON.parse(filteredInfo.to_magic_number);
      let toticket =
        filteredInfo.to_ticket != "" &&
        filteredInfo.to_ticket != null &&
        JSON.parse(filteredInfo.to_ticket);
      let to_include_exclude = filteredInfo.to_include_exclude_status;
      let to_include_exclude_ticket =
        filteredInfo.to_include_exclude_status_ticket;

      let startdateTo = filteredInfo.startdateTo;
      let enddateTo =
        filteredInfo.enddateTo == null || filteredInfo.enddateTo == ""
          ? new Date()
          : filteredInfo.enddateTo;

      let newRecord = accountInfo.filter((rec) => rec.id == fromAccountId);
      let newToRecord = accountInfo.filter((rec) => rec.id == toAccountId);

      let newCommissionRecord = accountInfo.filter(
        (rec) => rec.id == commission_acount_id
      );

      let equity =
        newCommissionRecord && newCommissionRecord.length > 0
          ? newCommissionRecord[0].accounts_details[0].equity
          : 0;

      if (historyOrderInfo[0].profit !== null) {
        history_info = eval(historyOrderInfo[0].profit) - equity;
      } else {
        let customDeposite = await CustomDeposite.findAll({
          where: { account_id: commission_acount_id },
          raw: true,
        });
        if (customDeposite.length) {
          history_info = equity - customDeposite[0].value;
        }
      }

      filteredInfo.accountFromInfo = newRecord;
      filteredInfo.accountToInfo = newToRecord;
      filteredInfo.history_info = history_info;
      filteredInfo.accountCommissionInfo = newCommissionRecord;

      let CustomSwap = await CustomSwapModel.findAll({
        attributes: ["account_id", "close_value"],
        where: { account_id: { [Op.in]: [toAccountId, fromAccountId] } },
        raw: true,
      });

      //Function from commonData file
      let commonData;
      await common
        .commonHistory(
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
            fromticket,
            toticket,
            from_include_exclude_ticket,
            to_include_exclude_ticket,
          },
          "account"
        )
        .then((res) => {
          commonData = res;
        })
        .catch((err) => {
          console.log(err);
        });

      //Send Api Response
      return res.status(200).json({
        rows: filteredInfo,
        fromHistoryOrderInfo:
          commonData !== undefined ? commonData.openOrderFromInfo : [],
        toHistoryOrderInfo:
          commonData !== undefined ? commonData.openOrderToInfo : [],
        customSwapTable: customSwapTable,
      });
    }
    return res.status(200).json({
      rows: [],
      fromHistoryOrderInfo: [],
      toHistoryOrderInfo: [],
      commissionHistoryOrderInfo: [],
    });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchStatusData = async (req, res, next) => {
  try {
    let status = {};
    if (req.userdata) {
      status = {
        user_status: 1,
      };
    } else {
      status = {
        status: 1,
      };
    }
    let filteredInfo = await filteredProfileModel.findOne({
      where: status,
      raw: true,
    });
    let filterInfo = filteredInfo;

    let fromAccountInfo = await accountModel.findOne({
      where: { id: filterInfo.from_account_id },
      attributes: ["login", "id", "alias"],
    });

    let toAccountInfo = await accountModel.findOne({
      where: { id: filterInfo.to_account_id },
      attributes: ["login", "id", "alias"],
    });

    let frSymJson = filterInfo.from_symbols;
    let fromsymbols = JSON.parse(frSymJson);
    let toSymJson = filterInfo.to_symbols;
    let toAccountId = filteredInfo.to_account_id;
    let fromAccountId = filteredInfo.from_account_id;
    let tosymbols = JSON.parse(toSymJson);
    let tomagicAccount =
      filterInfo.to_magic_number != "" &&
      filterInfo.to_magic_number != null &&
      JSON.parse(filterInfo.to_magic_number);
    let frommagicAccount =
      filterInfo.from_magic_number != "" &&
      filterInfo.from_magic_number != null &&
      JSON.parse(filterInfo.from_magic_number);
    let toticket =
      filteredInfo.to_ticket != "" &&
      filteredInfo.to_ticket != null &&
      JSON.parse(filteredInfo.to_ticket);
    let fromticket =
      filteredInfo.from_ticket != "" &&
      filteredInfo.from_ticket != null &&
      JSON.parse(filteredInfo.from_ticket);
    let to_include_exclude = filterInfo.to_include_exclude_status;
    let from_include_exclude = filterInfo.from_include_exclude_status;
    let to_include_exclude_ticket = filterInfo.to_include_exclude_status_ticket;
    let from_include_exclude_ticket =
      filterInfo.from_include_exclude_status_ticket;
    let startdateFrom = filterInfo.startdateFrom;
    let enddateFrom =
      filterInfo.enddateFrom == null || filterInfo.enddateFrom == ""
        ? new Date()
        : filterInfo.enddateFrom;
    let startdateTo = filterInfo.startdateTo;
    let enddateTo =
      filterInfo.enddateTo == null || filterInfo.enddateTo == ""
        ? new Date()
        : filterInfo.enddateTo;

    let fromSymbolInfo = [];
    let toSymbolInfo = [];
    let fromOpenOrderInfos = [];
    let toOpenOrderInfos = [];
    if (filterInfo != null) {
      //Function from commonData file
      let commonData;
      await common
        .statusData({
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
        })
        .then((data) => {
          commonData = data;
          //Send Api Response
          return res.status(200).json({
            rows: filterInfo,
            fromAccounts:
              commonData !== undefined ? commonData.fromAccountInfo : [],
            fromSymbol:
              commonData !== undefined ? commonData.fromSymbolInfo : [],
            toAccounts:
              commonData !== undefined ? commonData.toAccountInfo : [],
            toSymbol: commonData !== undefined ? commonData.toSymbolInfo : [],
            fromOpenOrderInfos:
              commonData !== undefined ? commonData.fromOpenOrderInfos : [],
            toOpenOrderInfos:
              commonData !== undefined ? commonData.toOpenOrderInfos : [],
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

module.exports = {
  fetchAllAccounts,
  fetchAllSymbol,
  fetchAllOpenTrade,
  fetchAllHistoryTrade,
  fetchLastUpdatedTime,
  fetchStatusData,
};
