"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      // Define the association to User
      Wallet.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Wallet.init(
    {
      balance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      profit: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      copytradeProfit: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      copytradeBalance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      referralBalance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
          notNull:{msg:'A wallet must belong to a user'}
        }
      },
    },
    {
      sequelize,
      modelName: "Wallet",
      tableName:'wallets'
    }
  );
  return Wallet;
};