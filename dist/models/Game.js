"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    id;
    players = {};
    board = Array(9).fill(null);
    turn; // which symbol's turn
    finished = false;
    winner = null;
    createdAt = Date.now();
    constructor(id, first) {
        this.id = id;
        this.turn = first;
    }
    assignPlayer(player) {
        this.players[player.symbol] = player;
    }
    isValidMove(playerId, index) {
        if (this.finished)
            return { ok: false, reason: "game_already_finished" };
        if (index < 0 || index > 8)
            return { ok: false, reason: "invalid_index" };
        const symbol = this.getPlayerSymbol(playerId);
        if (!symbol)
            return { ok: false, reason: "not_a_player" };
        if (symbol !== this.turn)
            return { ok: false, reason: "not_your_turn" };
        if (this.board[index] !== null)
            return { ok: false, reason: "cell_occupied" };
        return { ok: true };
    }
    getPlayerSymbol(playerId) {
        if (this.players.X?.id === playerId)
            return "X";
        if (this.players.O?.id === playerId)
            return "O";
        return null;
    }
    makeMove(playerId, index) {
        const v = this.isValidMove(playerId, index);
        if (!v.ok)
            throw new Error(v.reason);
        const symbol = this.getPlayerSymbol(playerId);
        this.board[index] = symbol;
        // check for win/draw
        const winner = Game.checkWinner(this.board);
        if (winner) {
            this.finished = true;
            this.winner = winner === "draw" ? "draw" : winner;
        }
        else {
            // swap turn
            this.turn = this.turn === "X" ? "O" : "X";
        }
        return { board: this.board.slice(), turn: this.turn, winner: this.winner };
    }
    forfeit(opponentWins, forfeiterId) {
        if (this.finished)
            return;
        this.finished = true;
        if (opponentWins) {
            const opponentSymbol = this.players.X?.id === forfeiterId ? "O" : "X";
            this.winner = opponentSymbol;
        }
        else {
            this.winner = "draw";
        }
    }
    static checkWinner(board) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6] // diags
        ];
        for (const [a, b, c] of lines) {
            if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(cell => cell !== null))
            return "draw";
        return null;
    }
    serialize() {
        return {
            id: this.id,
            board: this.board,
            turn: this.turn,
            finished: this.finished,
            winner: this.winner,
            players: {
                X: this.players.X ? { id: this.players.X.id, name: this.players.X.name } : null,
                O: this.players.O ? { id: this.players.O.id, name: this.players.O.name } : null
            }
        };
    }
}
exports.default = Game;
