'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'lobby_info',
      {
        lobby_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
        game_state: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        player_list: {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
        },
        turn: {
          type: Sequelize.INTEGER,
        }
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('lobby_info');
  }
}