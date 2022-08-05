'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Reviews', [{
      comment: 'I\'m so satisfied with his job, recommended freelancer :)',
      rating: 5,
      accepted: true,
      ProfileId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      comment: 'Very good!',
      rating: 5,
      accepted: true,
      ProfileId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Reviews', null, {});
  }
};
