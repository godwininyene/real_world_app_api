'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PaymentOption extends Model {
    static associate(models) {
      // define association here
    }
  }
  PaymentOption.init({
    payOption:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{msg: 'Please provide payment option'},
        notEmpty:{msg:'Payment option cannot be empty'}
      }
    },
    bank:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{msg: 'Please provide bank name'},
        notEmpty:{msg:'Bank name cannot be empty'}
      }
    },
    accountNumber:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{msg:' Please provide account number'},
        notEmpty:{msg: 'Account number cannot be empty'}
      }
    },
    image: DataTypes.STRING,
    extra: DataTypes.STRING,
    displayStatus:{
      type:DataTypes.BOOLEAN,
      defaultValue:true
    }
  }, {
    sequelize,
    modelName: 'PaymentOption',
    tableName:'paymentOptions'
  });
  return PaymentOption;
};