'use strict';
const bcrypt = require('bcryptjs');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('pass1234', 12);

    await queryInterface.bulkInsert('users', [{
      firstName: 'Super',
      lastName: 'Admin',
      username:'realword_admin',
      email: 'admin@realworld-app.com',
      phone: '+12345678901',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'admin@realworld-app.com' }, {});
  }
};
