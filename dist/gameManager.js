"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const game_1 = require("./game");
class GameManager {
    static getInstance() {
        if (GameManager.instance) {
            return GameManager.instance;
        }
        GameManager.instance = new GameManager();
        return GameManager.instance;
    }
    constructor() {
        this.games = new Map();
        this.onlinePlayers = new Map();
        this.waitingQueue = [];
    }
    addPlayer(player) {
        this.onlinePlayers.set(player.playerId, player);
    }
    createGame(playerXName, socketId) {
        const game = new game_1.Game(playerXName);
        this.games.set(game.gameId, game);
        this.enque(game.gameId);
        return game.gameId;
    }
    joinGame(gameId, player, socketId) {
        const game = this.games.get(gameId);
        if (game) {
            player.joinGame(gameId);
            game.addPlayer(player);
            return game;
        }
        return null;
    }
    removeGame(gameId) {
        this.games.delete(gameId);
    }
    getGame(gameId) {
        return this.games.get(gameId);
    }
    deque() {
        return this.waitingQueue.pop();
    }
    enque(gameId) {
        return this.waitingQueue.unshift(gameId);
    }
    isAnyWaiting() {
        return this.waitingQueue.length > 0;
    }
    findPlayer(socketId) {
        return this.onlinePlayers.get(socketId);
    }
}
exports.GameManager = GameManager;
