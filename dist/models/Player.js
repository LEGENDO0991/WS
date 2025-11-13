"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Player.ts
class Player {
    id; // socket id or unique user id
    name; // optional display name
    symbol; // X or O
    constructor(id, symbol, name) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
    }
}
exports.default = Player;
