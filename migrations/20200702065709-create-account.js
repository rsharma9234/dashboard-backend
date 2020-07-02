'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      login: {
        type: Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING(50)
      },
      broker: {
        type: Sequelize.STRING(50)
      },
      alias: {
        type: Sequelize.STRING(50)
      },
      status:{
        type: Sequelize.INTEGER(1)
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
    await queryInterface.dropTable('accounts');
  }
};