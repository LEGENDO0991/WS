"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GameManager {
    games = new Map();
    playerToGame = new Map(); // playerId -> gameId
    addGame(game) {
        this.games.set(game.id, game);
        if (game.players.X)
            this.playerToGame.set(game.players.X.id, game.id);
        if (game.players.O)
            this.playerToGame.set(game.players.O.id, game.id);
    }
    removeGame(gameId) {
        const g = this.games.get(gameId);
        if (!g)
            return;
        if (g.players.X)
            this.playerToGame.delete(g.players.X.id);
        if (g.players.O)
            this.playerToGame.delete(g.players.O.id);
        this.games.delete(gameId);
    }
    getGameById(id) {
        return this.games.get(id);
    }
    getGameByPlayerId(playerId) {
        const gid = this.playerToGame.get(playerId);
        if (!gid)
            return undefined;
        return this.games.get(gid);
    }
    handleMove(playerId, index) {
        const game = this.getGameByPlayerId(playerId);
        if (!game)
            throw new Error("no_game");
        const result = game.makeMove(playerId, index);
        if (game.finished) {
            // cleanup mapping but keep game if you want to query finished games
            this.playerToGame.delete(game.players.X.id);
            this.playerToGame.delete(game.players.O.id);
        }
        return { game, result };
    }
    handleDisconnect(playerId) {
        const game = this.getGameByPlayerId(playerId);
        if (!game)
            return {};
        // If game exists and not finished, mark opponent winner
        if (!game.finished) {
            const opponent = game.players.X?.id === playerId ? game.players.O : game.players.X;
            game.forfeit(true, playerId);
            // cleanup mappings
            this.playerToGame.delete(playerId);
            if (opponent)
                this.playerToGame.delete(opponent.id);
            // remove game from active list
            this.games.delete(game.id);
            return { game, opponentId: opponent?.id, forcedWin: true };
        }
        else {
            // if already finished just cleanup references
            this.playerToGame.delete(playerId);
            this.games.delete(game.id);
            return { game, forcedWin: false };
        }
    }
}
exports.default = GameManager;
