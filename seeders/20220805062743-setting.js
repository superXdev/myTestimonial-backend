'use strict';
require('dotenv').config();

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Settings', [{
      adminUsername: process.env.ADMIN_USERNAME,
      chatId: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Settings', null, {});
  }
};
