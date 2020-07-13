'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //     console.log(models, 'models')
    //     account.hasMany(models.accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    //     // account.hasMany(accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    // }
  };
  account.init({
    login: DataTypes.INTEGER,
    password: DataTypes.STRING(50),
    broker: DataTypes.STRING(50),
    alias: DataTypes.STRING(50),
    status:DataTypes.INTEGER(1),
    active:DataTypes.INTEGER(1),
    launched:DataTypes.INTEGER(1),

  },{
    createdAt:false,
    updatedAt:false,
    sequelize,
    modelName: 'account',
  });

  account.associate = function (models) {
    account.hasMany(models.accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.open_order, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.history_order, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.custom_swap, { foreignKey: 'account_id', sourceKey: 'id' });
    // account.hasMany(models.filtered_profile, { foreignKey: 'from_account_id', sourceKey: 'id' });
    // account.hasMany(models.filtered_profile, { foreignKey: 'to_account_id', sourceKey: 'id' });
  };

  return account;
};