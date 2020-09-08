'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class daily_swap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  daily_swap.init({
    date: DataTypes.DATE,
    account_login: DataTypes.STRING,
    profile_id: DataTypes.INTEGER,
    symbol: DataTypes.STRING,
    swap_long: DataTypes.DOUBLE,
    swap_short: DataTypes.DOUBLE
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'daily_swap',
  });
  return daily_swap;
};