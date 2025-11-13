"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/MatchMaker.ts
const Player_1 = __importDefault(require("../models/Player"));
const Game_1 = __importDefault(require("../models/Game"));
const uuid_1 = require("uuid");
class MatchMaker {
    queue = [];
    onMatch;
    constructor(onMatch) {
        this.onMatch = onMatch;
    }
    addToQueue(id, name) {
        // don't add duplicates
        if (this.queue.find(p => p.id === id))
            return { ok: false, reason: "already_in_queue" };
        // create a placeholder symbol until match created
        const tempSymbol = "X"; // will be reassigned when pairing
        const player = new Player_1.default(id, tempSymbol, name);
        this.queue.push(player);
        // try pair
        if (this.queue.length >= 2) {
            const a = this.queue.shift();
            const b = this.queue.shift();
            // assign symbols randomly
            const first = Math.random() > 0.5 ? "X" : "O";
            const pX = first === "X" ? a : b;
            const pO = first === "X" ? b : a;
            pX.symbol = "X";
            pO.symbol = "O";
            const game = new Game_1.default((0, uuid_1.v4)(), first);
            game.assignPlayer(pX);
            game.assignPlayer(pO);
            this.onMatch(game);
            return { ok: true, matched: true, gameId: game.id };
        }
        return { ok: true, matched: false };
    }
    removeFromQueue(id) {
        const idx = this.queue.findIndex(p => p.id === id);
        if (idx === -1)
            return false;
        this.queue.splice(idx, 1);
        return true;
    }
    getQueue() {
        return this.queue.map(p => ({ id: p.id, name: p.name }));
    }
}
exports.default = MatchMaker;
