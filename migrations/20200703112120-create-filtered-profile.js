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
      profile_name: DataTypes.STRING,
      from_account_id: Sequelize.INTEGER,
      to_account_id: Sequelize.INTEGER,
      startdateFrom: {
        type: Sequelize.DATE,
        field: 'startdateFrom'
      },
      enddateFrom: {
        type: Sequelize.DATE,
        field: 'enddateFrom'
      },
      from_symbols: Sequelize.STRING,
      startdateTo: {
        type: Sequelize.DATE,
        field: 'startdateTo'
      },
      enddateTo: {
        type: Sequelize.DATE,
        field: 'enddateTo'
      },
      to_symbols: Sequelize.STRING,
      status: DataTypes.INTEGER(1),
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