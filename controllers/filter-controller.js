"use strict";

const models = require('../models');
const filterModel = models.filtered_profile;
const accountModel = models.account;
const accountsDetailModel = models.accounts_detail;
const CustomSwapModel = models.custom_swap;
const symbolModel = models.symbol;
const historyOrderModel = models.history_order;
const customTable = models.custom_deposite



const addFilterData = async (req, res, next) => {
  console.log(req,"reeuest->>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<")
  try {
    // let Data = {
    //   profile_name: req.body.profile_name, 
    //   from_account_id: req.body.from_account_id, 
    //   to_account_id: req.body.to_account_id, 
    //   startdateFrom: req.body.startdateFrom,
    //   enddateFrom: req.body.enddateFrom, 
    //   startdateTo: req.body.startdateTo,
    //   enddateTo: req.body.enddateTo,
    //   from_symbols: req.body.from_symbols,
    //   to_symbols: req.body.to_symbols
    // };
    await filterModel.create(req.body);
    return res.status(200).json({ rows: 'Save' });

  } catch (err) {
    console.log(err, 'err')
    return res.status(err.status || 500).json(err);
  };
}

const fetchFilterData = async (req, res, next) => {
  try {
    let accountInfo = await accountModel.findAll({
      attributes: ['login', 'id', 'alias'],
      include: [accountsDetailModel]
    });
    let filterInfo = await filterModel.findAll({ raw: true });



    let newInfo = filterInfo.map((data) => {
      let newRecord = accountInfo.filter(rec => rec.id == data.from_account_id);
      let newToRecord = accountInfo.filter(rec => rec.id == data.to_account_id);
      let newCommissionRecord = accountInfo.filter(rec => rec.id == data.commission_acount_id);
      let newDetailFrom = accountInfo.filter(rec => rec.id == data.from_account_id);
      let newDetailTo = accountInfo.filter(rec => rec.id == data.to_account_id);



      data.accountFromInfo = newRecord;
      data.accountToInfo = newToRecord;
      data.accountCommissionInfo = newCommissionRecord;
      data.accountDetailFrom = newDetailFrom;
      data.accountDetailTo = newDetailTo;

      return data;
    });
    return res.status(200).json({ rows: newInfo });
    // return res.status(200).json({ rows: filterInfo});

  } catch (err) {
    return res.status(err.status || 500).json(err);
  };
}

// const fetchSymbolData = async (req, res, next) => {
//   try{


//     // let accountSymbolInfo = await accountModel.findAll({
//     //   attributes: ['login', 'id', ],
//     //   include:[accountsDetailModel]
//     // });
//     let symbolInfo = await symbolModel.findAll({raw:true});
//       // let newSymbolInfo = symbolInfo.map( (data) => {
//       //   let newRecord = accountSymbolInfo.filter(rec => rec.id == data.from_account_id);
//       //   let newToRecord = accountSymbolInfo.filter(rec => rec.id == data.to_account_id);
//       //   data.accountFromInfo = newRecord;
//       //   data.accountToInfo = newToRecord;

//       //   return data;
//       //  });
//       return res.status(200).json({newSymbolInfo});
//       // return res.status(200).json({ rows: filterInfo});

//   } catch(err) {
//       return res.status(err.status || 500).json(err);
//   };
// }




// const getData = async (req, res, next) => {
//   console.log(req.params,"req .parems")
//   try {
//     const { account_id } = req.params
//     let historyOrderInfo = await historyOrderModel.findAll({
//       attributes: [

//         [Sequelize.literal('SUM(profit)'), 'profit'],
//       ],
//       where: { account_id: account_id, order_type: 6 },
//       raw: true
//     })
//     console.log(historyOrderInfo,"")
//     if ((historyOrderInfo !== null || historyOrderInfo !== undefined) && (historyOrderInfo.profit !== null)) {
//       let customNewInfo = customTable.findAll({
//         where: { account_id: account_id }
//       })
//       if (customNewInfo && customNewInfo.length > 0) {
//         customTable.update({ 'value': historyOrderInfo.profit, })
//          return res.status(200).json({ status: true });
//       }
//       else {
//         customTable.create({ 'account_id': account_id, value: historyOrderInfo.profit, })
//         return res.status(200).json({ status: true });
//       }

//     }
//   }
//   catch (err) {
//     return res.status(err.status || 500).json(err);
//   };
// }
const fetchActivefilterdata = async (req, res, next) => {

  try {
    let accountInfo = await accountModel.findAll({
      attributes: ['login', 'id', 'alias'],
      include: [accountsDetailModel]
    });
    let filterInfo = await filterModel.findAll({ where: { status: 1 }, raw: true });
    let swapInfo = await CustomSwapModel.findAll({ raw: true });

    let newInfo = filterInfo.map((data) => {
      let fromSymbol = JSON.parse(data.from_symbols)
      let toSymbol = JSON.parse(data.to_symbols)
      let combineSymbols = fromSymbol.concat(toSymbol);
      let uniqueSymbols = combineSymbols.filter((item, i, ar) => ar.indexOf(item) === i);
      let newRecord = accountInfo.filter(rec => rec.id == data.from_account_id);
      let newToRecord = accountInfo.filter(rec => rec.id == data.to_account_id);
      let newFromSwapRecord = swapInfo.filter(rec => rec.account_id == data.from_account_id);
      let newToSwapRecord = swapInfo.filter(rec => rec.account_id == data.to_account_id);
      let newCommission_acount_info = accountInfo.filter(rec => rec.id == data.commission_acount_id);


      data.accountFromInfo = newRecord;
      data.accountToInfo = newToRecord;
      data.symbols = uniqueSymbols;
      // data.swap_info = newSwapRecord;
      data.commission_acount_info = newCommission_acount_info
      data.swapFrominfo = newFromSwapRecord;
      data.swapToinfo = newToSwapRecord;
      return data;
    });

    return res.status(200).json({ rows: newInfo });

  } catch (err) {

    return res.status(err.status || 500).json(err);
  };
}

const updateFilterDataBkp = async (req, res, next) => {
  try {
    let { id } = req.body;
    let filterInfo = await filterModel.findOne({ where: { id } });


    if (filterInfo) {
      if (filterInfo.status == 0) {
        await filterModel.update({ status: 1 }, { where: { id } });
        return res.status(200).json({ rows: "Update" });
      }
      if (filterInfo.status == 1) {
        await filterModel.update({ status: 0 }, { where: { id } });
        return res.status(200).json({ rows: "Update" });
      }
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  };
}


const updateFilterData = async (req, res, next) => {
  try {
    let { id, status } = req.body;
    let filterInfos = await filterModel.findOne({ where: { id: id }, raw: true });
    let accountInfo = await accountModel.findAll({
      attributes: ['login', 'id', 'alias'],
      include: [accountsDetailModel]
    });
    if (filterInfos != null) {
      await filterModel.update({ status: 0 }, { where: { status: 1 } });
      await filterModel.update({ status: status }, { where: { id: id } });
      let filterInfo = await filterModel.findAll({ raw: true });
      let newInfo = filterInfo.map((data) => {
        let newRecord = accountInfo.filter(rec => rec.id == data.from_account_id);
        let newToRecord = accountInfo.filter(rec => rec.id == data.to_account_id);
        data.accountFromInfo = newRecord;
        data.accountToInfo = newToRecord;
        return data;
      });
      //  console.log(newInfo, 'newInfo')
      return res.status(200).json({ rows: newInfo });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  };
}

const deleteFilter = async (req, res, next) => {
  try {
    let { id } = req.body;
    let deleteInfo = await filterModel.findOne({
      where: {
        id
      }
    });
    if (deleteInfo) {
      await filterModel.destroy({ where: { id } })
      // await filterModel.update({status:1}, { where:{ id }});
      return res.status(200).json({ rows: "Deleted" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  };
}

const updateFilterDataFull = async (req, res, next) => {
  try {
    let { id, profile_name, from_account_id, to_account_id, startdateFrom, enddateFrom, startdateTo, enddateTo, from_symbols, to_symbols } = req.body;
    let filterUpdate = await filterModel.findOne({
      where: {
        id
      }
    });
    if (filterUpdate) {
      await filterModel.update({
        profile_name: profile_name,
        from_account_id: from_account_id,
        to_account_id: to_account_id,
        startdateFrom: startdateFrom,
        enddateFrom: enddateFrom,
        startdateTo: startdateTo,
        enddateTo: enddateTo,
        from_symbols: from_symbols,
        to_symbols: to_symbols,
      }, { where: { id } });
      return res.status(200).json({ rows: "Updated" });
    }
  } catch (err) {
    return res.status(err.status || 500).json(err);
  };
}


module.exports = {
  addFilterData,
  fetchFilterData,
  updateFilterData,
  deleteFilter,
  updateFilterDataFull,
  fetchActivefilterdata,
  
};