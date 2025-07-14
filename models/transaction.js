'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.User, {foreignKey: 'userId', as: 'user'})
    }
  }
  Transaction.init({
     type: {
      type: DataTypes.ENUM('investment deposit', 'copytrade deposit', 'withdrawal', 'investment'),
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide transaction type' },
        customValidator(value) {
          const validOptions = ['investment deposit', 'copytrade deposit', 'withdrawal', 'investment'];
          if (!validOptions.includes(value)) {
            throw new Error(`Transaction type must be one of: ${validOptions.join(', ')}. Got "${value}"`);
          }
        }
      
      }
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide amount' }
      }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed', 'declined'),
      defaultValue: 'pending',
       validate: {
        customValidator(value) {
          const validOptions = ['pending', 'success', 'failed', 'declined'];
          if (!validOptions.includes(value)) {
            throw new Error(`Status must be one of: ${validOptions.join(', ')}. Got "${value}"`);
          }
        }
      }
    },
    payOption: {
      type: DataTypes.ENUM('profit', 'balance', 'copytrade', 'referralBalance', 'copytradeBalance', 'copytradeProfit'),
      allowNull: true,
      validate: {
        customValidator(value) {
          const validOptions = ['profit', 'balance','copytrade', 'referralBalance', 'copytradeBalance', 'copytradeProfit'];
          if(value){
            if (!validOptions.includes(value)) {
              throw new Error(`Pay option must be one of: ${validOptions.join(', ')}. Got "${value}"`);
            }
          }
        }
      }
    },
    receipt: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentChannel: {
      type: DataTypes.ENUM('bank payment', 'crypto wallet', 'mobile transfer'),
      defaultValue: 'crypto wallet',
      validate: {
        customValidator(value) {
          const validOptions = ['bank payment', 'crypto wallet', 'mobile transfer'];
          if (!validOptions.includes(value)) {
            throw new Error(`Payment channel must be one of: ${validOptions.join(', ')}. Got "${value}"`);
          }
        }
      }
      
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName:'transactions'
  });
  return Transaction;
};