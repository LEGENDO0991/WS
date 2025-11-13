"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" }
});
const waitingPlayers = [];
const games = new Map();
function generateRoomId() {
    return Math.random().toString(36).substring(2, 9);
}
function checkWinner(board) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of wins) {
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }
    return null;
}
io.on("connection", (socket) => {
    console.log(`🔌 Player connected:`, socket.handshake.query);
    socket.broadcast.emit("newPlayer", { name: socket.handshake.query.email, id: socket.id });
    socket.on("findMatch", () => {
        if (waitingPlayers.length > 0) {
            const opponentSocketId = waitingPlayers.shift();
            const roomId = generateRoomId();
            const game = {
                id: roomId,
                board: Array(9).fill(""),
                players: [opponentSocketId, socket.id],
                currentTurn: opponentSocketId,
                winner: null
            };
            games.set(roomId, game);
            socket.join(roomId);
            io.sockets.sockets.get(opponentSocketId)?.join(roomId);
            io.to(roomId).emit("matchFound", {
                roomId,
                board: game.board,
                currentTurn: game.currentTurn,
                players: game.players
            });
        }
        else {
            waitingPlayers.push(socket.id);
            socket.emit("waitingForMatch");
        }
    });
    socket.on("makeMove", ({ roomId, index }) => {
        const game = games.get(roomId);
        if (!game || game.winner)
            return;
        if (game.currentTurn !== socket.id)
            return;
        if (game.board[index])
            return;
        const symbol = game.players[0] === socket.id ? "X" : "O";
        game.board[index] = symbol;
        const winner = checkWinner(game.board);
        if (winner) {
            game.winner = socket.id;
            io.to(roomId).emit("gameOver", {
                board: game.board,
                winner: socket.id
            });
        }
        else if (game.board.every(cell => cell !== "")) {
            io.to(roomId).emit("gameOver", {
                board: game.board,
                winner: null
            });
        }
        else {
            game.currentTurn = game.players.find(id => id !== socket.id);
            io.to(roomId).emit("updateBoard", {
                board: game.board,
                currentTurn: game.currentTurn
            });
        }
    });
    socket.on("disconnect", () => {
        console.log(`❌ Player disconnected: ${socket.id}`);
        // Remove from queue
        const idx = waitingPlayers.indexOf(socket.id);
        if (idx !== -1) {
            waitingPlayers.splice(idx, 1);
            return;
        }
        // Remove from game
        for (const [roomId, game] of games.entries()) {
            if (game.players.includes(socket.id)) {
                io.to(roomId).emit("opponentLeft");
                games.delete(roomId);
                break;
            }
        }
    });
});
app.get("/", (req, res) => {
    res.send("Tic Tac Toe Socket Server is running!");
});
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
