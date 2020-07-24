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
    profile_name: DataTypes.STRING,
    from_account_id: DataTypes.INTEGER,
    to_account_id: DataTypes.INTEGER,
    commission_acount_id:DataTypes.INTEGER,
   
    startdateFrom: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'startdateFrom'
    },
    enddateFrom: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'enddateFrom'
    },
    from_symbols: DataTypes.STRING,

    startdateTo: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'startdateTo'
    },
    enddateTo: {
      type: DataTypes.DATE,
      default: new Date(),
      field: 'enddateTo'
    },
    to_symbols: DataTypes.STRING,
    status: {
      type: DataTypes.INTEGER(1),
      default: 0,
      field: 'status'
  },
  auto_close:DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'filtered_profile',
  });


  // filtered_profile.associate = function (models) {
  //   filtered_profile.belongsTo(models.account, { foreignKey: 'from_account_id' });
  //   filtered_profile.belongsTo(models.account, { foreignKey: 'to_account_id' });
  // }

  return filtered_profile;
};