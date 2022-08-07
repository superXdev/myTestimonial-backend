'use strict';

const config = require('./config/config.json');

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Settings', [{
      adminUsername: config.telegram_username,
      chatId: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Settings', null, {});
  }
};
