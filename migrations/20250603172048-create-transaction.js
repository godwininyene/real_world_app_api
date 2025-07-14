'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.ENUM('investment deposit', 'copytrade deposit', 'withdrawal', 'investment'),
        allowNull: false
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD'
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'declined'),
        defaultValue: 'pending'
      },
      payOption: {
        type: Sequelize.ENUM('profit', 'balance', 'copytrade', 'referralBalance', 'copytradeBalance', 'copytradeProfit'),
        allowNull: true
      },
      receipt: {
        type: Sequelize.STRING
      },
      paymentChannel: {
        type: Sequelize.ENUM('bank payment', 'crypto wallet', 'mobile transfer'),
        defaultValue: 'crypto wallet'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('transactions');
  }
};