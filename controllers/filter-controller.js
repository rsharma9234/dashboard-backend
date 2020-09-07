"use strict";

const models = require("../models");
const filterModel = models.filtered_profile;
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const CustomSwapModel = models.custom_swap;
const dailySwapModel = models.daily_swap;

const addFilterData = async (req, res, next) => {
  try {
    await filterModel.create(req.body);
    return res.status(200).json({ rows: "Save" });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchFilterData = async (req, res, next) => {
  try {
    let limit = 10; // number of records per page
    let offset = 0;
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });
    await filterModel
      .findAndCountAll()
      .then((data) => {
        let page = req.query.page; // page number
        let pages = Math.ceil(data.count / limit);
        offset = limit * (page - 1);
        filterModel
          .findAll({
            limit: limit,
            offset: offset,
            $sort: { id: 1 },
            raw: true,
          })
          .then((filterInfo) => {
            let newInfo = filterInfo.map((data) => {
              let newRecord = accountInfo.filter(
                (rec) => rec.id == data.from_account_id
              );
              let newToRecord = accountInfo.filter(
                (rec) => rec.id == data.to_account_id
              );
              let newCommissionRecord = accountInfo.filter(
                (rec) => rec.id == data.commission_acount_id
              );
              let newDetailFrom = accountInfo.filter(
                (rec) => rec.id == data.from_account_id
              );
              let newDetailTo = accountInfo.filter(
                (rec) => rec.id == data.to_account_id
              );

              data.accountFromInfo = newRecord;
              data.accountToInfo = newToRecord;
              data.accountCommissionInfo = newCommissionRecord;
              data.accountDetailFrom = newDetailFrom;
              data.accountDetailTo = newDetailTo;

              return data;
            });
            return res
              .status(200)
              .json({ rows: newInfo, count: data.count, pages: pages });
          });
      })
      .catch(function (error) {
        res.status(500).send("Internal Server Error");
      });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchActivefilterdata = async (req, res, next) => {
  try {
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });
    let filterInfo = await filterModel.findAll({
      where: { status: 1 },
      raw: true,
    });
    let swapInfo = await CustomSwapModel.findAll({ raw: true });

    let newInfo = filterInfo.map((data) => {
      let fromSymbol = JSON.parse(data.from_symbols);
      let toSymbol = JSON.parse(data.to_symbols);
      let combineSymbols = fromSymbol.concat(toSymbol);
      let uniqueSymbols = combineSymbols.filter(
        (item, i, ar) => ar.indexOf(item) === i
      );
      let newRecord = accountInfo.filter(
        (rec) => rec.id == data.from_account_id
      );
      let newToRecord = accountInfo.filter(
        (rec) => rec.id == data.to_account_id
      );
      let newFromSwapRecord = swapInfo.filter(
        (rec) => rec.account_id == data.from_account_id
      );
      let newToSwapRecord = swapInfo.filter(
        (rec) => rec.account_id == data.to_account_id
      );
      let newCommission_acount_info = accountInfo.filter(
        (rec) => rec.id == data.commission_acount_id
      );

      data.accountFromInfo = newRecord;
      data.accountToInfo = newToRecord;
      data.symbols = uniqueSymbols;
      // data.swap_info = newSwapRecord;
      data.commission_acount_info = newCommission_acount_info;
      data.swapFrominfo = newFromSwapRecord;
      data.swapToinfo = newToSwapRecord;
      return data;
    });
    return res.status(200).json({ rows: newInfo });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const updateFilterData = async (req, res, next) => {
  try {
    let { id, status } = req.body;
    let filterInfos = await filterModel.findOne({
      where: { id: id },
      raw: true,
    });
    let accountInfo = await accountModel.findAll({
      attributes: ["login", "id", "alias"],
      include: [accountsDetailModel],
    });
    if (filterInfos != null) {
      await filterModel.update({ status: 0 }, { where: { status: 1 } });
      await filterModel.update({ status: status }, { where: { id: id } });
      let filterInfo = await filterModel.findAll({ raw: true });
      let newInfo = filterInfo.map((data) => {
        let newRecord = accountInfo.filter(
          (rec) => rec.id == data.from_account_id
        );
        let newToRecord = accountInfo.filter(
          (rec) => rec.id == data.to_account_id
        );
        let newCommission_acount_info = accountInfo.filter(
          (rec) => rec.id == data.commission_acount_id
        );

        data.accountFromInfo = newRecord;
        data.accountToInfo = newToRecord;
        data.commission_acount_info = newCommission_acount_info;

        return data;
      });

      return res.status(200).json({ rows: newInfo });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const deleteFilter = async (req, res, next) => {
  try {
    let { id } = req.body;
    let deleteInfo = await filterModel.findOne({
      where: {
        id,
      },
    });
    if (deleteInfo) {
      await filterModel.destroy({ where: { id } });
      // await filterModel.update({status:1}, { where:{ id }});
      return res.status(200).json({ rows: "Deleted" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const updateFilterDataFull = async (req, res, next) => {
  try {
    let {
      id,
      profile_name,
      from_account_id,
      to_account_id,
      startdateFrom,
      enddateFrom,
      startdateTo,
      enddateTo,
      from_symbols,
      to_symbols,
      commission_acount_id,
      auto_close,
      from_magic_number,
      to_magic_number,
      from_include_exclude_status,
      to_include_exclude_status,
    } = req.body;
    let filterUpdate = await filterModel.findOne({
      where: {
        id,
      },
    });

    if (filterUpdate) {
      await filterModel.update(
        {
          profile_name: profile_name,
          from_account_id: from_account_id,
          to_account_id: to_account_id,
          commission_acount_id: commission_acount_id,
          startdateFrom: startdateFrom,
          enddateFrom: enddateFrom,
          startdateTo: startdateTo,
          enddateTo: enddateTo,
          from_symbols: from_symbols,
          to_symbols: to_symbols,
          auto_close: auto_close,
          from_magic_number: from_magic_number,
          to_magic_number: to_magic_number,
          from_include_exclude_status: from_include_exclude_status,
          to_include_exclude_status: to_include_exclude_status,
        },
        { where: { id } }
      );
      return res.status(200).json({ rows: "Updated" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

const fetchDailySwaps = async (req, res, next) => {
  try {
    let dailySwaps = await dailySwapModel.findAll({
      raw: true,
    });
    if (dailySwaps) {
      return res.status(200).json({ rows: dailySwaps });
    }
    return res.status(200).json({ rows: [] });
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

module.exports = {
  addFilterData,
  fetchFilterData,
  updateFilterData,
  deleteFilter,
  updateFilterDataFull,
  fetchActivefilterdata,
  fetchDailySwaps
};
