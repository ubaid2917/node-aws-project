'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
       id: {
           type: Sequelize.STRING,
           primaryKey: true,
           defaultValue: Sequelize.literal('gen_random_uuid()'),
         },
         name: {
           type: Sequelize.STRING,
           allowNull: false,
         },
         email: {
           type: Sequelize.STRING,
           allowNull: false,
         },
         password: {
           type: Sequelize.STRING,
           allowNull: false,
         },
         profile: {
           type: Sequelize.STRING,
           allowNull: true,
         },
         created: {
          type: Sequelize.DATE,
          field: "created",
          defaultValue: Sequelize.NOW,
        },
        updated: {
          type: Sequelize.DATE,
          field: "updated",
          defaultValue: Sequelize.NOW,
        },
        deleted: {
          type: Sequelize.DATE,
          field: "deleted",
        },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};