"use strict";

const models = require('../models');
const filterModel = models.filtered_profile;
const accountModel = models.account;

const addFilterData = async (req, res, next) => {
  
  try{
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
      return res.status(200).json({ rows: 'Save'});
      
  } catch(err) {
    console.log(err, 'err')
      return res.status(err.status || 500).json(err);
  };
}

const fetchFilterData = async (req, res, next) => {
  try{
    let accountInfo = await accountModel.findAll({
      attributes: ['login', 'id', 'alias'],
      raw:true
    });
    let filterInfo = await filterModel.findAll({raw:true});
      let newInfo = filterInfo.map( (data) => {
        let newRecord = accountInfo.filter(rec => rec.id == data.from_account_id);
        let newToRecord = accountInfo.filter(rec => rec.id == data.to_account_id);
        console.log(newRecord, 'newRecord')
        data.accountFromInfo = newRecord;
        data.accountToInfo = newToRecord
        return data;
       });
       console.log(newInfo, 'newInfo')
      return res.status(200).json({ rows: newInfo});
      // return res.status(200).json({ rows: filterInfo});

  } catch(err) {
      return res.status(err.status || 500).json(err);
  };
}

const updateFilterData = async (req, res, next) => {
  try{
    let {id} = req.body;
    let filterInfo = await filterModel.findOne({
      where:{
        id
    }
    });
    if(filterInfo){
      if(filterInfo.status == 0){
        await filterModel.update({status:1}, { where:{ id }});
      }
      if(filterInfo.status == 1){
        await filterModel.update({status:0}, { where:{ id }});
      }
   }
  console.log(filterInfo,'filterInfo');
  
      // return res.status(200).json({ rows: filterInfo});

  } catch(err) {
      return res.status(err.status || 500).json(err);
  };
}


module.exports = {
  addFilterData,
  fetchFilterData,
  updateFilterData
};