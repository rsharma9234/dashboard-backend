'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      balance: {
        type: Sequelize.DOUBLE
      },
      equity: {
        type: Sequelize.DOUBLE
      },
      margin: {
        type: Sequelize.DOUBLE
      },
      free_margin: {
        type: Sequelize.DOUBLE
      },
      margin_level: {
        type: Sequelize.DOUBLE(20, 0),
        defaultValue: 0
      },
      profit: {
        type: Sequelize.DOUBLE
      },
      currency: {
        type: Sequelize.STRING(50)
      }

      // },
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
    await queryInterface.dropTable('accounts_details');
  }
};