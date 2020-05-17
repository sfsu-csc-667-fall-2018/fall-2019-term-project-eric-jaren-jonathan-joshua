module.exports = class Game {
    constructor(lobbyId, playerInfo, state) {
        this._lobbyId = lobbyId;
        this._playerInfo = playerInfo;
        this._state = state;
    }
}