'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('symbols', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(50)
      },
      digits: {
        type: Sequelize.INTEGER
      },
      stops_level: {
        type: Sequelize.DOUBLE
      },
      contract_size: {
        type: Sequelize.DOUBLE
      },
      margin_currency: {
        type: Sequelize.STRING(50)
      },
      min_volume: {
        type: Sequelize.DOUBLE
      },
      max_volume: {
        type: Sequelize.DOUBLE
      },
      volume_step: {
        type: Sequelize.DOUBLE
      },
      swap_long: {
        type: Sequelize.DOUBLE
      },
      swap_short: {
        type: Sequelize.DOUBLE
      }
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
    await queryInterface.dropTable('symbols');
  }
};