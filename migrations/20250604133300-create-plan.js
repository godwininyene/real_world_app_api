'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      minDeposit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      maxDeposit: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      planDuration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      timingParameter: {
        type: Sequelize.ENUM("hours", "days"),
        defaultValue: "hours",
      },
      percentage: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      referalBonus: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      allowReferral: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: "USD",
      },
      returnPrincipal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: Sequelize.TEXT,
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plans');
  }
};