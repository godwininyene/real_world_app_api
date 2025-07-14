'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Plans', [
      {
        name: 'STARTER PLAN',
        minDeposit: 100,
        maxDeposit: 2000,
        planDuration: 24,
        timingParameter: 'hours',
        percentage: 30,
        referalBonus: 3,
        allowReferral: true,
        currency: 'USD',
        description:'Perfect for beginners looking to explore cryptocurrency investments.',
        returnPrincipal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ECONOMY PLAN',
        minDeposit: 2000,
        maxDeposit: 5000,
        planDuration: 3,
        timingParameter: 'days',
        percentage: 50,
        referalBonus: 5,
        allowReferral: true,
        currency: 'USD',
        description:'Ideal for investors aiming for steady and secure returns.',
        returnPrincipal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
       {
        name: 'PROFESSIONAL PLAN',
        minDeposit: 5000,
        maxDeposit: 10000,
        planDuration: 5,
        timingParameter: 'days',
        percentage: 75,
        referalBonus: 8,
        allowReferral: true,
        currency: 'USD',
        description:'For experienced investors seeking high-yield opportunities.',
        returnPrincipal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'LEGENDARY PLAN',
        minDeposit: 10000,
        maxDeposit: 100000,
        planDuration: 7,
        timingParameter: 'days',
        percentage: 85,
        referalBonus: 10,
        allowReferral: true,
        currency: 'USD',
        description:'Premium plan for serious investors looking for maximum gains.',
        returnPrincipal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
     
      
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Plans', {
      name: [
        'LEGENDARY PLAN',
        'PROFESSIONAL PLAN',
        'ECONOMY PLAN',
        'STARTER PLAN'
      ]
    }, {});
  }
};