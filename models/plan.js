"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    static associate(models) {
      Plan.hasMany(models.Investment, {
        foreignKey: "planId",
        as: "investments",
      });
    }
  }

  Plan.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "A plan must have a name",
          },
          notEmpty: {
            msg: "A plan must have a name",
          }
        },
      },
      minDeposit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A plan must have minimum deposit",
          },
          isNumeric: {
            msg: "Minimum deposit must be a number",
          },
          min: {
            args: [0],
            msg: "Minimum deposit must be positive",
          },
        },
      },
      maxDeposit: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A plan must have maximum deposit",
          },
          isNumeric: {
            msg: "Maximum deposit must be a number",
          },
          min: {
            args: [0],
            msg: "Maximum deposit must be positive",
          },
        },
      },
      planDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A plan must have duration",
          },
          isInt: {
            msg: "Plan duration must be an integer",
          },
          min: {
            args: [1],
            msg: "Plan duration must be at least 1",
          },
        },
      },
      timingParameter: {
        type: DataTypes.ENUM("hours", "days"),
        defaultValue: "hours",
        validate: {
          isIn: {
            args: [["hours", "days"]],
            msg: "Timing parameter must be either 'hours' or 'days'",
          },
        },
      },
      percentage: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A plan must have a percentage value",
          },
          isNumeric: {
            msg: "Percentage must be a number",
          },
          min: {
            args: [0],
            msg: "Percentage must be positive",
          },
        },
      },
      referalBonus: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        validate: {
          isNumeric: {
            msg: "Referral bonus must be a number",
          },
        },
      },
      allowReferral: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
        validate: {
          isAlpha: {
            msg: "Currency must contain only letters",
          },
          len: {
            args: [3, 3],
            msg: "Currency must be 3 characters long",
          },
        },
      },
      returnPrincipal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Plan",
      tableName:"plans"
    }
  );

  return Plan;
};