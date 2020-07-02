'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('history_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_id: {
        type: Sequelize.INTEGER
      },
      ticket: {
        type: Sequelize.INTEGER
      },
      open_time: {
        // type: Sequelize.DATE
        allowNull: false,
        type: Sequelize.DATE,
        default: new Date(),
        field: 'open_time'
      },
      order_type: {
        type: Sequelize.INTEGER
      },
      lots: {
        type: Sequelize.DOUBLE
      },
      symbol: {
        type: Sequelize.STRING(50)
      },
      magic_number: {
        type: Sequelize.INTEGER
      },
      open_price: {
        type: Sequelize.DOUBLE
      },
      sl: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      tp: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      close_time: {
        allowNull: false,
        type: Sequelize.DATE,
        default: new Date(),
        field: 'close_time'
      },
      close_price: {
        type: Sequelize.DOUBLE
      },
      commission: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      taxes: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      swap: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      profit: {
        type: Sequelize.DOUBLE(22, 0),
        defaultValue: 0
      },
      comment: {
        type: Sequelize.STRING(150)
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('history_orders');
  }
};