'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Faq.init({
    question:{
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{msg:'Faq must have a question'},
        notEmpty:{msg: 'Question cannot be empty'}
      }
    },
    answer:{
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notNull:{msg:'Faq must have an answer'},
        notEmpty:{msg: 'Answer cannot be empty'}
      }
    }
  }, {
    sequelize,
    modelName: 'Faq',
    tableName:'faqs'
  });
  return Faq;
};