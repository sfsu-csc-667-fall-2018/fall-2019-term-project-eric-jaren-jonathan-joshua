'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'lobby_3',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        card_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        player_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lobby_3');
  }
}; 