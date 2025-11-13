"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(name, socketId) {
        this.name = name;
        this.inGame = false;
        this.gameId = '';
        this.socketId = socketId;
        this.playerId = socketId;
    }
    joinGame(gameId) {
        this.gameId = gameId;
        this.inGame = true;
    }
    leaveGame() {
        this.inGame = false;
        this.gameId = '';
    }
}
exports.Player = Player;
