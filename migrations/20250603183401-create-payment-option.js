'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paymentOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payOption: {
        type: Sequelize.STRING,
        allowNull:false
      },
      bank: {
        type: Sequelize.STRING,
        allowNull:false
      },
      accountNumber: {
        type: Sequelize.STRING,
         allowNull:false
      },
      image: {
        type: Sequelize.STRING
      },
      extra: {
        type: Sequelize.STRING
      },
      displayStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue:true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('paymentOptions');
  }
};