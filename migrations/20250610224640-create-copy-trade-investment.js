'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('copyTradeInvestments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull:false,
        type: Sequelize.INTEGER,
         references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      copyTradeId: {
        allowNull:false,
        type: Sequelize.INTEGER,
        references: {
          model: "CopyTrades",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      amount: {
        allowNull:false,
        type: Sequelize.FLOAT
      },
      stopLoss: {
        type: Sequelize.FLOAT,
        allowNull: false, // Matches model validation
        validate: {
          min: 0, // Minimum 0%
          max: 100, // Maximum 100%
        },
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'completed', 'cancelled'),
        defaultValue: "active",
      },
      profit: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
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
    await queryInterface.dropTable('copyTradeInvestments');
  }
};