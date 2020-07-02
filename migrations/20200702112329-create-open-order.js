'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('open_orders', {
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
        allowNull: false,
        type: Sequelize.DATE,
        default:new Date()
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
      last_price: {
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
      // },

      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('open_orders');
  }
};