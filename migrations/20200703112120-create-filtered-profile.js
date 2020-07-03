'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('filtered_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_account_id: Sequelize.INTEGER,
      to_account_id: Sequelize.INTEGER,
      from_account_dateFrom: {
        type: Sequelize.DATE,
        field: 'from_account_dateFrom'
      },
      from_account_dateTo: {
        type: Sequelize.DATE,
        field: 'from_account_dateTo'
      },
      from_symbols: Sequelize.STRING,
      to_account_dateFrom: {
        type: Sequelize.DATE,
        field: 'from_account_dateFrom'
      },
      to_account_dateTo: {
        type: Sequelize.DATE,
        field: 'from_account_dateTo'
      },
      to_symbols: Sequelize.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('filtered_profiles');
  }
};