'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class symbol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  symbol.init({
    name: DataTypes.STRING(50),
    digits: DataTypes.INTEGER,
    stops_level: DataTypes.DOUBLE,
    contract_size: DataTypes.DOUBLE,
    margin_currency: DataTypes.STRING(50),
    min_volume: DataTypes.DOUBLE,
    max_volume: DataTypes.DOUBLE,
    volume_step: DataTypes.DOUBLE,
    swap_long: DataTypes.DOUBLE,
    swap_short: DataTypes.DOUBLE
  }, {
    createdAt:false,
    updatedAt:false,
    sequelize,
    modelName: 'symbol',
  });
  return symbol;
};