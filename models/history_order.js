'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class history_order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  history_order.init({
    account_id: {
      type: DataTypes.INTEGER
    },
    ticket: {
      type: DataTypes.INTEGER
    },
    open_time: {
      // type: DataTypes.DATE
      allowNull: false,
      type: DataTypes.DATE,
      default: new Date(),
      field: 'open_time'
    },
    order_type: {
      type: DataTypes.INTEGER
    },
    lots: {
      type: DataTypes.DOUBLE
    },
    symbol: {
      type: DataTypes.STRING(50)
    },
    magic_number: {
      type: DataTypes.INTEGER
    },
    open_price: {
      type: DataTypes.DOUBLE
    },
    sl: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    tp: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    close_time: {
      allowNull: false,
      type: DataTypes.DATE,
      default: new Date(),
      field: 'close_time'
    },
    close_price: {
      type: DataTypes.DOUBLE
    },
    commission: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    taxes: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    swap: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    profit: {
      type: DataTypes.DOUBLE(22, 0),
      defaultValue: 0
    },
    comment: {
      type: DataTypes.STRING(150)
    }
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'history_order',
  });

  history_order.associate = function (models) {
    history_order.belongsTo(models.account, { foreignKey: 'account_id' });
  }
  return history_order;
};