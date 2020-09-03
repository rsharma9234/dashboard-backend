'use strict';
const { Model } = require('sequelize');
const CryptoJS = require('crypto-js');
const keys = require('../config/cryptoJs')
const key = CryptoJS.enc.Utf8.parse(keys.key);
const iv = CryptoJS.enc.Utf8.parse(keys.iv);

const Decryption = (number) => {
  var decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Hex.parse(number).toString(CryptoJS.enc.Base64), key,
    {
      keySize: 256 / 32,
      iv: iv,
      mode: CryptoJS.mode.CBC,
    });

  // padding: CryptoJS.pad.Pkcs7
  return decrypted.toString(CryptoJS.enc.Utf8);
};

const Encryption = (number) => {
  var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(number), key,
    {
      keySize: 256 / 32,
      iv: iv,
      mode: CryptoJS.mode.CBC,
    });
  // padding: CryptoJS.pad.Pkcs7
  return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(encrypted.toString()));
};

module.exports = (sequelize, DataTypes) => {
  class account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    //     console.log(models, 'models')
    //     account.hasMany(models.accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    //     // account.hasMany(accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    // }
  };
  account.init({
    login: DataTypes.INTEGER,
    password: DataTypes.STRING(50),
    broker: DataTypes.STRING(50),
    alias: DataTypes.STRING(50),
    status: DataTypes.INTEGER(1),
    active: DataTypes.INTEGER(1),
    launched: DataTypes.INTEGER(1),

  }, {
    createdAt: false,
    updatedAt: false,
    hooks: {
        beforeCreate: (user, options) => {
          if (user.password) {
            user.password = Encryption(user.password);
          }
          return user;
        },
        beforeUpdate: (user, options) => {
          if (user.attributes.password) {
            user.attributes.password = Encryption(user.attributes.password);
          }
          return user;
        },
        beforeBulkUpdate: (user, options) => {
          if (user.attributes.password) {
            user.attributes.password = Encryption(user.attributes.password);
          }
          return user;
        }
    },
    sequelize,
    modelName: 'account',
  });

  account.associate = function (models) { 
    account.hasMany(models.accounts_detail, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.open_order, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.history_order, { foreignKey: 'account_id', sourceKey: 'id' });
    account.hasMany(models.custom_swap, { foreignKey: 'account_id', sourceKey: 'id' });
    // account.hasMany(models.filtered_profile, { foreignKey: 'from_account_id', sourceKey: 'id' });
    // account.hasMany(models.filtered_profile, { foreignKey: 'to_account_id', sourceKey: 'id' });
  };

  account.comparePassword = (user_password, password) => {
    let decryptPassWord = Decryption(password);
    if (user_password == decryptPassWord) {
      return true
    } else {
      return false
    }
  }

  account.prototype.Decryption = (number) => {
    var decrypted = CryptoJS.AES.decrypt(CryptoJS.enc.Hex.parse(number).toString(CryptoJS.enc.Base64), key,
      {
        keySize: 256 / 32,
        iv: iv,
        mode: CryptoJS.mode.CBC,
      });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  account.prototype.Encryption = (number) => {
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(number), key,
      {
        keySize: 256 / 32,
        iv: iv,
        mode: CryptoJS.mode.CBC,
      });

    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(encrypted.toString()));
  };

  return account;
};