"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      // Define association to User
      BankAccount.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  BankAccount.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A bank account must belong to a user",
          },
          notEmpty: {
            msg: "A bank account must belong to a user",
          },
        },
      },
      network: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide network",
          },
          notEmpty: {
            msg: "Please provide network",
          },
        },
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide wallet address",
          },
          notEmpty: {
            msg: "Please provide wallet address",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "BankAccount",
      tableName:'bankAccounts'
    }
  );

  return BankAccount;
};