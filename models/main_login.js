'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class main_login extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  main_login.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    createdAt: false,
    updatedAt: false,
    sequelize,
    modelName: 'main_login',
  });
  return main_login;
};