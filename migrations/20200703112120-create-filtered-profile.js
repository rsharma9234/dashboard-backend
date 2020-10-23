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
      profile_name: Sequelize.STRING,
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
      comm_magic_number: Sequelize.STRING,
      startdateComm: {
        type: Sequelize.DATE,
        field: 'startdateComm'
      },
      enddateComm: {
        type: Sequelize.DATE,
        field: 'enddateComm'
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
      status: {
        type: Sequelize.INTEGER(1),
        default: 0,
        field: 'status'
    },
    comm_include_exclude_status: {
      type: Sequelize.INTEGER(1),
      default: 0,
      field: 'comm_include_exclude_status'
  },
    user_status: {
      type: Sequelize.INTEGER(1),
      default: 0,
      field: 'user_status'
  },
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