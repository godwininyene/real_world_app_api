"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CopyTradeInvestment extends Model {
    static associate(models) {
      // Belongs to User
      this.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete:"CASCADE"
      });

      // Belongs to CopyTrade
      this.belongsTo(models.CopyTrade, {
        foreignKey: "copyTradeId",
        as: "copyTrade",
        onDelete:"CASCADE"
      });
    }
  }

  CopyTradeInvestment.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "User ID is required" },
        },
      },
      copyTradeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Copy Trade ID is required" },
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: { msg: "Investment amount is required" },
          min: { args: [0], msg: "Amount cannot be negative" },
        },
      },
      stopLoss: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Stop loss percentage is required",
          },
          isFloat: {
            msg: "Stop loss must be a number",
          },
          min: {
            args: [0],
            msg: "Stop loss cannot be negative",
          },
          max: {
            args: [100],
            msg: "Stop loss cannot exceed 100%",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "active", "completed", "cancelled"),
        defaultValue: "pending",
      },
      profit: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "CopyTradeInvestment",
      tableName:"copyTradeInvestments"
    }
  );

  return CopyTradeInvestment;
};