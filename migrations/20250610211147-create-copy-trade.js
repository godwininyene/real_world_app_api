'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('copyTrades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tradeName: {
        type: Sequelize.STRING,
        allowNull: false, // Matches model validation
      },
      tradeUsername: {
        type: Sequelize.STRING,
        allowNull: false, // Matches model validation
      },
      minDeposit: {
        type: Sequelize.FLOAT,
        allowNull: false, // Matches model validation
        validate: {
          min: 0, // Ensures non-negative values at DB level
        },
      },
      fees: {
        type: Sequelize.FLOAT,
        allowNull: false, // Matches model validation
        validate: {
          min: 0, // Minimum 0%
          max: 100, // Maximum 100%
        },
      },
      investors: {
        type: Sequelize.INTEGER,
        allowNull: false, // Matches model validation
        validate: {
          min: 0, // Non-negative count
        },
      },
      monthlyReturn: {
        type: Sequelize.FLOAT,
        allowNull: false, // Matches model validation
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true, 
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
    await queryInterface.addIndex('copyTrades', ['tradeUsername']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('copyTrades');
  }
};