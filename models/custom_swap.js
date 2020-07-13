'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class custom_swap extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  custom_swap.init({
    account_id: DataTypes.INTEGER,
    open_value:{
      type: DataTypes.DOUBLE(20, 0),
      defaultValue: 0
    },
    close_value:{
      type: DataTypes.DOUBLE(20, 0),
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'custom_swap',
  });

  custom_swap.associate = function (models) {
    custom_swap.belongsTo(models.account, { foreignKey: 'account_id'});
  }
  return custom_swap;
};