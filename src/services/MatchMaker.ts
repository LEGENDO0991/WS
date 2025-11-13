// src/services/MatchMaker.ts
import Player from "../models/Player";
import Game from "../models/Game";
import { v4 as uuidv4 } from "uuid";

type OnMatchCallback = (game: Game) => void;

export default class MatchMaker {
  private queue: Player[] = [];
  private onMatch: OnMatchCallback;

  constructor(onMatch: OnMatchCallback) {
    this.onMatch = onMatch;
  }

  public addToQueue(id: string, name?: string) {
    // don't add duplicates
    if (this.queue.find(p => p.id === id)) return { ok: false, reason: "already_in_queue" };

    // create a placeholder symbol until match created
    const tempSymbol: "X" | "O" = "X"; // will be reassigned when pairing
    const player = new Player(id, tempSymbol, name);
    this.queue.push(player);
    // try pair
    console.log(this.getQueue())
    if (this.queue.length >= 2) {
      const a = this.queue.shift()!;
      const b = this.queue.shift()!;
      // assign symbols randomly
      const first = Math.random() > 0.5 ? "X" : "O";
      const pX = first === "X" ? a : b;
      const pO = first === "X" ? b : a;
      pX.symbol = "X";
      pO.symbol = "O";
      const game = new Game(uuidv4(), first);
      game.assignPlayer(pX);
      game.assignPlayer(pO);
      this.onMatch(game);
      return { ok: true, matched: true, gameId: game.id };
    }

    return { ok: true, matched: false };
  }

  public removeFromQueue(id: string) {
    const idx = this.queue.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.queue.splice(idx, 1);
    return true;
  }

  public getQueue() {
    return this.queue.map(p => ({ id: p.id, name: p.name }));
  }
}

