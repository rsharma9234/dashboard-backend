'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class accounts_detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   accounts_detail.belongsTo(models.account, { foreignKey: 'account_id' });

    //   // define association here
    // }
  };
  accounts_detail.init({
    account_id:{
      type : DataTypes.INTEGER,
      allowNull: false
    },
    balance: DataTypes.DOUBLE,
    equity:  DataTypes.DOUBLE,
    margin:DataTypes.DOUBLE,
    free_margin: DataTypes.DOUBLE,
    profit: DataTypes.DOUBLE,
    currency: DataTypes.STRING(50)
  }, {
    createdAt:false,
    updatedAt:false,
    sequelize,
    modelName: 'accounts_detail',
  });

  accounts_detail.associate = function (models) {
    accounts_detail.belongsTo(models.account, { foreignKey: 'account_id' });
  }

  return accounts_detail;
};