'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class filtered_profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  filtered_profile.init({
    from_account_id: DataTypes.INTEGER,
    to_account_id: DataTypes.INTEGER,
    from_account_dateFrom: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'from_account_dateFrom'
    },
    from_account_dateTo: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'from_account_dateTo'
    },
    from_symbols: DataTypes.STRING,
    to_account_dateFrom: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'from_account_dateFrom'
    },
    to_account_dateTo: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'from_account_dateTo'
    },
    to_symbols: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'filtered_profile',
  });
  return filtered_profile;
};