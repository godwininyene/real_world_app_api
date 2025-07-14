"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallets", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      balance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      profit: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      copytradeProfit: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      copytradeBalance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      referralBalance: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.addConstraint("Wallets", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_wallet_user",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE", // delete wallet if user is deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("wallets");
  },
};