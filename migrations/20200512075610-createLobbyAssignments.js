'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'lobby_assignments',
      {
        player_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        lobby_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lobby_assignments');
  }
}; 