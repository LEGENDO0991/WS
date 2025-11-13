"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const crypto_1 = require("crypto");
class Game {
    constructor(playerXName = '', playerYName = '') {
        this.board = new Array(9).fill('');
        this.currentPlayer = 'x';
        this.gameState = 'waiting';
        this.gameResult = '';
        this.gameOver = false;
        this.gameId = (0, crypto_1.randomUUID)();
        this.boardStates = [];
        this.players = [];
    }
    makeMove(move) {
        if (this.gameState === 'waiting') {
            throw new Error('Game has not started yet');
        }
        if (this.board[move] === '') {
            this.board[move] = this.currentPlayer;
            this.addBoardState(this.board.join(''));
            const win = this.checkWin();
            if (win) {
                this.gameResult = `${this.currentPlayer} won`;
                this.gameState = 'finished';
                this.gameOver = true;
                return `${this.currentPlayer} won`;
            }
            else if (this.board.every(move => move !== '')) {
                this.gameResult = 'draw';
                this.gameState = 'finished';
                this.gameOver = true;
                return 'draw';
            }
            else {
                this.currentPlayer = this.currentPlayer === 'o' ? 'x' : 'o';
                return this.currentPlayer;
            }
        }
        else {
            return 'invalid move';
        }
    }
    checkWin() {
        return Game.winConditions.some(condition => {
            const [a, b, c] = condition;
            return this.board[a] === this.currentPlayer && this.board[b] === this.currentPlayer && this.board[c] === this.currentPlayer;
        });
    }
    start() {
        this.gameState = 'playing';
    }
    markGameOver() {
        this.gameOver = true;
    }
    isGameOver() {
        return this.gameOver;
    }
    addBoardState(board) {
        this.boardStates.push(board);
    }
    addPlayer(player) {
        this.players.push(player);
    }
    leaverPlayer(socketId) {
        this.players = this.players.filter(player => player.socketId !== socketId);
    }
}
exports.Game = Game;
Game.winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
