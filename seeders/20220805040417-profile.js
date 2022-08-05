'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Profiles', [{
      fullName: 'John Doe',
      position: 'CEO',
      website: 'http://example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      fullName: 'Rahmat Sri',
      position: 'CTO',
      website: 'http://rahmat.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Profiles', null, {});
  }
};
