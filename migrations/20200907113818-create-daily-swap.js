'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_swaps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      account_login: {
        type: Sequelize.STRING
      },
      profile_id: {
        type: Sequelize.INTEGER
      },
      symbol: {
        type: Sequelize.STRING
      },
      swap_long: {
        type: Sequelize.DOUBLE
      },
      swap_short: {
        type: Sequelize.DOUBLE
      },
      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('daily_swaps');
  }
};