"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MatchMaker_1 = __importDefault(require("../services/MatchMaker"));
const GameManager_1 = __importDefault(require("../services/GameManager"));
class SocketController {
    io;
    matchMaker;
    gameManager;
    constructor(io) {
        this.io = io;
        this.gameManager = new GameManager_1.default();
        // when matched we add game and notify players
        this.matchMaker = new MatchMaker_1.default((game) => {
            this.gameManager.addGame(game);
            const pX = game.players.X;
            const pO = game.players.O;
            // join them to a socket room for convenience
            this.io.sockets.sockets.get(pX.id)?.join(game.id);
            this.io.sockets.sockets.get(pO.id)?.join(game.id);
            // notify both players
            this.io.to(pX.id).emit("matched", { game: game.serialize(), yourSymbol: "X", opponent: { id: pO.id, name: pO.name } });
            this.io.to(pO.id).emit("matched", { game: game.serialize(), yourSymbol: "O", opponent: { id: pX.id, name: pX.name } });
            // broadcast start
            this.io.to(game.id).emit("start_game", game.serialize());
        });
        this.register();
    }
    register() {
        this.io.on("connection", (socket) => {
            console.log("socket connected:", socket.id);
            // Client asks to join queue: payload may contain name
            socket.on("join_queue", (payload) => {
                const { name } = payload || {};
                const res = this.matchMaker.addToQueue(socket.id, name);
                socket.emit("queue_update", { ok: res.ok, matched: res.matched });
                if (!res.matched) {
                    // inform queue state
                    socket.emit("queued");
                }
            });
            socket.on("leave_queue", () => {
                const removed = this.matchMaker.removeFromQueue(socket.id);
                socket.emit("left_queue", { removed });
            });
            socket.on("make_move", (payload) => {
                try {
                    const { index } = payload;
                    const { game, result } = this.gameManager.handleMove(socket.id, index);
                    // broadcast updated board to the room
                    this.io.to(game.id).emit("move_made", { board: result.board, turn: result.turn, winner: result.winner });
                    if (result.winner) {
                        this.io.to(game.id).emit("game_over", { winner: result.winner });
                        // option: cleanup already done in manager for finished game
                        this.gameManager.removeGame(game.id);
                    }
                }
                catch (err) {
                    socket.emit("invalid_move", { reason: err.message });
                }
            });
            socket.on("leave_game", () => {
                // treat as disconnect / forfeit
                const res = this.gameManager.handleDisconnect(socket.id);
                if (res.game && res.opponentId && res.forcedWin) {
                    this.io.to(res.opponentId).emit("opponent_left", { reason: "opponent_disconnected", winner: true });
                    this.io.to(res.game.id).emit("game_over", { winner: res.game.winner });
                }
            });
            socket.on("request_game_state", () => {
                const game = this.gameManager.getGameByPlayerId(socket.id);
                if (game) {
                    socket.emit("game_state", game.serialize());
                }
                else {
                    socket.emit("game_state", null);
                }
            });
            socket.on("disconnect", (reason) => {
                // Remove from queue if waiting
                const removed = this.matchMaker.removeFromQueue(socket.id);
                if (removed) {
                    console.log("removed from queue on disconnect:", socket.id);
                }
                // If was in game, forfeit and notify opponent
                const res = this.gameManager.handleDisconnect(socket.id);
                if (res.game && res.opponentId && res.forcedWin) {
                    this.io.to(res.opponentId).emit("opponent_left", { reason: "opponent_disconnected", winner: true });
                    this.io.to(res.game.id).emit("game_over", { winner: res.game.winner });
                }
                console.log("socket disconnected:", socket.id, "reason:", reason);
            });
        });
    }
}
exports.default = SocketController;
