"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CopyTrade extends Model {
    static associate(models) {
    }
  }

  CopyTrade.init(
    {
      tradeName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Trade name is required",
          },
          notEmpty: {
            msg: "Trade name cannot be empty",
          },
          len: {
            args: [2, 50],
            msg: "Trade name must be between 2-50 characters",
          },
        },
      },
      tradeUsername: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Username is required",
          },
          notEmpty: {
            msg: "Username cannot be empty",
          },
          is: {
            args: /^@\w+$/,
            msg: "Username must start with @ (e.g., @Thinkcapital)",
          },
        },
      },
      minDeposit: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Minimum deposit is required",
          },
          isFloat: {
            msg: "Minimum deposit must be a number",
          },
          min: {
            args: [0],
            msg: "Minimum deposit cannot be negative",
          },
        },
      },
      fees: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Fees percentage is required",
          },
          isFloat: {
            msg: "Fees must be a number",
          },
          min: {
            args: [0],
            msg: "Fees cannot be negative",
          },
          max: {
            args: [100],
            msg: "Fees cannot exceed 100%",
          },
        },
      },
      investors: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Investor count is required",
          },
          isInt: {
            msg: "Investors must be an integer",
          },
          min: {
            args: [0],
            msg: "Investor count cannot be negative",
          },
        },
      },
      monthlyReturn: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Monthly return is required",
          },
          isFloat: {
            msg: "Monthly return must be a number",
          },
        },
      },
      image: {
        type: DataTypes.STRING,
        // validate: {
        //   isUrl: {
        //     msg: "Image must be a valid URL (or file path)",
        //     args: { require_protocol: false }, // Allows relative paths
        //   },
        // },
      },
    },
    {
      sequelize,
      modelName: "CopyTrade",
      tableName:'copyTrades'
    }
  );

  return CopyTrade;
};