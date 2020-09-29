"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class userFilter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  userFilter.init(
    {
      userId: DataTypes.INTEGER,
      filterId: DataTypes.INTEGER,
      filterStatus: DataTypes.INTEGER,
    },
    {
      createdAt: false,
      updatedAt: false,
      sequelize,
      modelName: "userFilter",
    }
  );
  return userFilter;
};
