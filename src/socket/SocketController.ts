// src/socket/SocketController.ts
import { Server, Socket } from "socket.io";
import MatchMaker from "../services/MatchMaker.js";
import GameManager from "../services/GameManager.js";
import Game from "../models/Game.js";

interface OnlinePlayer {
  id: string;
  name: string;
  email: string;
}

export default class SocketController {
  private io: Server;
  private matchMaker: MatchMaker;
  private gameManager: GameManager;
  private onlinePlayers: OnlinePlayer[] = [];
  constructor(io: Server) {
    this.io = io;
    this.gameManager = new GameManager();
    // when matched we add game and notify players
    this.matchMaker = new MatchMaker((game: Game) => {
      this.gameManager.addGame(game);
      const pX = game.players.X!;
      const pO = game.players.O!;
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

  private register() {
    this.io.on("connection", (socket: Socket) => {
      console.log("socket connected:", socket.id);

      const { name, email } = socket.handshake.query;
      const safeEmail = typeof email === 'string' ? email : '';
      const safeName = typeof name === 'string' ? name : 'Anonymous';

      console.log("Player connected:", safeName, safeEmail);
      if (safeEmail !== "" && safeName !== "Anonymous" && safeName !== "undefined" && this.onlinePlayers.every(player => player.email !== email)) {
        this.onlinePlayers.push({
          id: socket.id,
          name: safeName,
          email: safeEmail
        })
      }
      this.io.emit("online_players", this.onlinePlayers);

      socket.on("join", (name) => {
        socket.data.name = name;
        console.log(`${name} joined`);
      });

      // Client asks to join queue: payload may contain name
      socket.on("join_queue", (payload: { name?: string }) => {
        console.log("Someone joined QUEUE")
        const { name } = payload || {};
        const res = this.matchMaker.addToQueue(socket.id, name);
        this.io.emit("queue_update", { ok: res.ok, matched: res.matched });
        if (!res.matched) {
          // inform queue state
          socket.emit("queued");
        }
      });

      socket.on("leave_queue", () => {
        console.log("Someone left QUEUE")

        const removed = this.matchMaker.removeFromQueue(socket.id);
        socket.emit("left_queue", { removed });
      });

      socket.on("make_move", (payload: { index: number }) => {
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
        } catch (err: any) {
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
        } else {
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

        this.onlinePlayers.filter(p => p.email === safeEmail);
        this.io.emit("player_left", this.onlinePlayers)

        console.log("socket disconnected:", socket.id, "reason:", reason);
      });
    });
  }
}
