"use strict";

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../models");
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const openOrderModel = models.open_order;
const historyOrderModel = models.history_order;
``;
const filteredProfileModel = models.filtered_profile;
const CustomSwapModel = models.custom_swap;
const CustomDeposite = models.custom_deposite;
const common = require("./commonData");

const calculatingOpenTrade = async (req, res, next) => {
  //open postions data goes here
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
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
      raw: true,
    });

    if (filteredInfo != null) {
      let openOrderFromInfo = [];
      let openOrderToInfo = [];
      let totalOfFromOpenOrder = 0;
      let totalOfToOpenOrder = 0;

      let fromAccountId = filteredInfo.from_account_id;
      let fromsymbols = JSON.parse(filteredInfo.from_symbols);
      // let startdateFrom = filteredInfo.startdateFrom;
      // let enddateFrom =
      //   filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == ""
      //     ? new Date()
      //     : filteredInfo.enddateFrom;

      let tomagicAccount =
        filteredInfo.to_magic_number != "" &&
        filteredInfo.to_magic_number != null &&
        JSON.parse(filteredInfo.to_magic_number);
      let frommagicAccount =
        filteredInfo.from_magic_number != "" &&
        filteredInfo.from_magic_number != null &&
        JSON.parse(filteredInfo.from_magic_number);
      let toticket =
        filteredInfo.to_ticket != "" &&
        filteredInfo.to_ticket != null &&
        JSON.parse(filteredInfo.to_ticket);
      let fromticket =
        filteredInfo.from_ticket != "" &&
        filteredInfo.from_ticket != null &&
        JSON.parse(filteredInfo.from_ticket);

      let toAccountId = filteredInfo.to_account_id;
      let tosymbols = JSON.parse(filteredInfo.to_symbols);
      // let startdateTo = filteredInfo.startdateTo;
      // let enddateTo =
      //   filteredInfo.enddateTo == null || filteredInfo.enddateTo == ""
      //     ? new Date()
      //     : filteredInfo.enddateTo;
      let to_include_exclude = filteredInfo.to_include_exclude_status;
      let from_include_exclude = filteredInfo.from_include_exclude_status;
      let to_include_exclude_ticket =
        filteredInfo.to_include_exclude_status_ticket;
      let from_include_exclude_ticket =
        filteredInfo.from_include_exclude_status_ticket;
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
      await common
        .openTrade(
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
            totalOfFromOpenOrder,
            totalOfToOpenOrder,
            openOrderFromInfo,
            openOrderToInfo,
            fromticket,
            toticket,
            from_include_exclude_ticket,
            to_include_exclude_ticket,
          },
          "whatAmCalculating"
        )
        .then((res) => {
          commonData = res;
        })
        .catch((err) => {
          console.log(err);
        });

      return res.status(200).json({
        rows: filteredInfo,
        fromOpenOrderInfo:
          commonData !== undefined ? commonData.openOrderFromInfo : [],
        toOpenOrderInfo:
          commonData !== undefined ? commonData.openOrderToInfo : [],
        totalOfOpenOrder:
          commonData !== undefined ? commonData.totalOfOpenOrder : {},
      });
    }
    return res.status(200).json({
      rows: [],
      OpenOrder: [],
      fromOpenOrderInfo: [],
      toOpenOrderInfo: [],
    });
  } catch (err) {
    return res.status(err.status || 500).json(console.log(err));
  }
};

const calculatingHistoryTrade = async (req, res, next) => {
  // close position data goes here
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
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });

    let ml = filteredInfo.commission_acount_id;

    let historyOrderInfo = await historyOrderModel.findAll({
      attributes: [
        [Sequelize.literal("SUM(profit)"), "profit"], // coming null
      ],
      where: { order_type: 6, account_id: ml },
      raw: true,
    });
    let customSwapTable = await CustomSwapModel.findAll({
      attributes: { exclude: ["id"] },
      raw: true,
    });
    if (filteredInfo != null) {
      let openOrderFromInfo = [];
      let openOrderToInfo = [];
      let totalOfFromHistoryOrder = 0;
      let totalOfToHistoryOrder = 0;
      let fromAccountId = filteredInfo.from_account_id;
      let fromsymbols = JSON.parse(filteredInfo.from_symbols);

      let tomagicAccount =
        filteredInfo.to_magic_number != "" &&
        filteredInfo.to_magic_number != null &&
        JSON.parse(filteredInfo.to_magic_number);
      let frommagicAccount =
        filteredInfo.from_magic_number != "" &&
        filteredInfo.from_magic_number != null &&
        JSON.parse(filteredInfo.from_magic_number);
      let toticket =
        filteredInfo.to_ticket != "" &&
        filteredInfo.to_ticket != null &&
        JSON.parse(filteredInfo.to_ticket);
      let fromticket =
        filteredInfo.from_ticket != "" &&
        filteredInfo.from_ticket != null &&
        JSON.parse(filteredInfo.from_ticket);
      let startdateFrom = filteredInfo.startdateFrom;
      let enddateFrom =
        filteredInfo.enddateFrom == null || filteredInfo.enddateFrom == ""
          ? new Date()
          : filteredInfo.enddateFrom;
      let toAccountId = filteredInfo.to_account_id;
      let tosymbols = JSON.parse(filteredInfo.to_symbols);
      let startdateTo = filteredInfo.startdateTo;
      let enddateTo =
        filteredInfo.enddateTo == null || filteredInfo.enddateTo == ""
          ? new Date()
          : filteredInfo.enddateTo;

      let newRecord = accountInfo.filter((rec) => rec.id == fromAccountId);
      let newToRecord = accountInfo.filter((rec) => rec.id == toAccountId);
      let newCommissionRecord = accountInfo.filter((rec) => rec.id == ml);
      let to_include_exclude = filteredInfo.to_include_exclude_status;
      let from_include_exclude = filteredInfo.from_include_exclude_status;
      let to_include_exclude_ticket =
        filteredInfo.to_include_exclude_status_ticket;
      let from_include_exclude_ticket =
        filteredInfo.from_include_exclude_status_ticket;
      let equity =
        newCommissionRecord && newCommissionRecord.length > 0
          ? newCommissionRecord[0].accounts_details[0].equity
          : 0;

      let history_info = 0;
      if (historyOrderInfo[0].profit !== null) {
        history_info = eval(historyOrderInfo[0].profit) - equity;
      } else {
        let customDeposite = await CustomDeposite.findAll({
          where: { account_id: ml },
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
          "whatAmCalculating"
        )
        .then((res) => {
          commonData = res;
        })
        .catch((err) => {
          console.log(err);
        });

      return res.status(200).json({
        rows: filteredInfo,
        customSwapTable: customSwapTable,
        fromHistoryOrderInfo:
          commonData !== undefined ? commonData.openOrderFromInfo : [],
        toHistoryOrderInfo:
          commonData !== undefined ? commonData.openOrderToInfo : [],
        totalOfHistoryOrder:
          commonData !== undefined ? commonData.totalOfHistoryOrder : {},
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

const calculatingCommission = async (req, res, next) => {
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
    let commission_acount_id = filteredInfo.commission_acount_id;
    let startdateComm = filteredInfo.startdateComm;
    let enddateComm =
      filteredInfo.enddateComm == null || filteredInfo.enddateComm == ""
        ? new Date()
        : filteredInfo.enddateComm;
    let comm_magic_number = filteredInfo.comm_magic_number != "" &&
      filteredInfo.comm_magic_number != null &&
      JSON.parse(filteredInfo.comm_magic_number);
    let historyOrderData = await historyOrderModel.findAll({
      where: {
        account_id: commission_acount_id,
        order_type: 6,
        magic_number: { [Op.in]: comm_magic_number },
        open_time: {
          [Op.gte]: startdateComm,
          [Op.lt]: enddateComm,
        },
      },
      attributes: { exclude: ["id"] },
      raw: true,
    });
    let accountTableDetails = await accountsDetailModel.findAll({
      where: { account_id: commission_acount_id },
      attributes: { exclude: ["id"] },
      raw: true,
    });
    let totalProfit = 0;
    let profit = historyOrderData.map((data) => data.profit);
    totalProfit = profit.reduce((a, b) => a + b, 0);
    let equity = accountTableDetails.map((data) => data.equity);
    let commission = totalProfit - equity;
    return res.status(200).json({
      commission_acount_id: commission_acount_id,
      equity: equity,
      totalProfit: totalProfit,
      commission: commission,
    });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

module.exports = {
  calculatingOpenTrade,
  calculatingHistoryTrade,
  calculatingCommission,
};
