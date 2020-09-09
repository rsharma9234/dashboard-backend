"use strict";

const models = require("../models");
const dailySwapModel = models.daily_swap;
const filterModel = models.filtered_profile;
const accountModel = models.account;
const symbolModel = models.symbol;

const cronSwapValues = async () => {
    let filterInfo = await filterModel.findAll({
      where: { status: 1 },
      raw: true,
    });
    let fromAccountInfo = await accountModel.findAll({
      where:{
          id: filterInfo[0].from_account_id
      }
    });
    let fromAccount = fromAccountInfo[0].login
    let fromSymbol = JSON.parse(filterInfo[0].from_symbols)[0]
    let fromSymbolInfo = await symbolModel.findOne({
      where: { name: fromSymbol, login: fromAccount },
      order: [['id', 'desc']],
      raw: true,
    });
    
    dailySwapModel.create({
      date: new Date(),
      profile_id: filterInfo[0].id,
      account_login: fromAccount,
      symbol: fromSymbol,
      swap_long: fromSymbolInfo.swap_long,
      swap_short: fromSymbolInfo.swap_short,
    })
    
    let toAccountInfo = await accountModel.findAll({
      where:{
        id: filterInfo[0].to_account_id
      }
    });
    let toAccount = toAccountInfo[0].login
    let toSymbol = JSON.parse(filterInfo[0].to_symbols)[0]
    let toSymbolInfo = await symbolModel.findOne({
      where: { name: toSymbol, login: toAccount },
      order: [['id', 'desc']],
      raw: true,
    });
    
    dailySwapModel.create({
      date: new Date(),
      profile_id: filterInfo[0].id,
      account_login: toAccount,
      symbol: toSymbol,
      swap_long: toSymbolInfo.swap_long,
      swap_short: toSymbolInfo.swap_short,
    })
};

module.exports = {
  cronSwapValues,
};
