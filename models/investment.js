"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Investment extends Model {
    static associate(models) {
      // Define associations
      Investment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete:'CASCADE'
      });
      
      Investment.belongsTo(models.Plan, {
        foreignKey: "planId",
        as: "plan",
        onDelete:'CASCADE'
      });
    }
  }

  Investment.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Investment must belong to a user",
          },
          notEmpty: {
            msg: "Investment must belong to a user",
          },
        },
      },
      planId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Investment must belong to a plan",
          },
          notEmpty: {
            msg: "Investment must belong to a plan",
          },
        },
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Please provide amount to invest",
          },
          notEmpty: {
            msg: "Please provide amount to invest",
          },
          min: {
            args: [0],
            msg: "Investment amount must be positive",
          },
        },
      },
      profit: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "completed", "failed"),
        defaultValue: "active",
        validate: {
          isIn: {
            args: [["active", "completed", "failed"]],
            msg: "Status must be either active, completed, or failed",
          },
        },
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Investment must have an expiry date!",
          },
          isDate: {
            msg: "Expiry date must be a valid date",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Investment",
      tableName:'investments'
    }
  );

  return Investment;
};