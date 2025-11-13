// src/models/Game.ts
import Player from "./Player";

export type Board = (null | "X" | "O")[]; // length 9: 0..8

export default class Game {
  public id: string;
  public players: { X?: Player; O?: Player } = {};
  public board: Board = Array(9).fill(null);
  public turn: "X" | "O"; // which symbol's turn
  public finished: boolean = false;
  public winner: null | "X" | "O" | "draw" = null;
  public createdAt: number = Date.now();

  constructor(id: string, first: "X" | "O") {
    this.id = id;
    this.turn = first;
  }

  public assignPlayer(player: Player) {
    this.players[player.symbol] = player;
  }

  public isValidMove(playerId: string, index: number): { ok: boolean; reason?: string } {
    if (this.finished) return { ok: false, reason: "game_already_finished" };
    if (index < 0 || index > 8) return { ok: false, reason: "invalid_index" };
    const symbol = this.getPlayerSymbol(playerId);
    if (!symbol) return { ok: false, reason: "not_a_player" };
    if (symbol !== this.turn) return { ok: false, reason: "not_your_turn" };
    if (this.board[index] !== null) return { ok: false, reason: "cell_occupied" };
    return { ok: true };
  }

  private getPlayerSymbol(playerId: string): "X" | "O" | null {
    if (this.players.X?.id === playerId) return "X";
    if (this.players.O?.id === playerId) return "O";
    return null;
  }

  public makeMove(playerId: string, index: number) {
    const v = this.isValidMove(playerId, index);
    if (!v.ok) throw new Error(v.reason);

    const symbol = this.getPlayerSymbol(playerId)!;
    this.board[index] = symbol;
    // check for win/draw
    const winner = Game.checkWinner(this.board);
    if (winner) {
      this.finished = true;
      this.winner = winner === "draw" ? "draw" : (winner as "X" | "O");
    } else {
      // swap turn
      this.turn = this.turn === "X" ? "O" : "X";
    }
    return { board: this.board.slice(), turn: this.turn, winner: this.winner };
  }

  public forfeit(opponentWins: boolean, forfeiterId: string) {
    if (this.finished) return;
    this.finished = true;
    if (opponentWins) {
      const opponentSymbol = this.players.X?.id === forfeiterId ? "O" : "X";
      this.winner = opponentSymbol as "X" | "O";
    } else {
      this.winner = "draw";
    }
  }

  public static checkWinner(board: Board): null | "X" | "O" | "draw" {
    const lines: [number, number, number][] = [
      [0,1,2],[3,4,5],[6,7,8], // rows
      [0,3,6],[1,4,7],[2,5,8], // cols
      [0,4,8],[2,4,6]          // diags
    ];
    for (const [a,b,c] of lines) {
      if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as "X" | "O";
      }
    }
    if (board.every(cell => cell !== null)) return "draw";
    return null;
  }

  public serialize() {
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
