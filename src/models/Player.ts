// src/models/Player.ts
export default class Player {
  public id: string;          // socket id or unique user id
  public name?: string;       // optional display name
  public symbol: "X" | "O";   // X or O

  constructor(id: string, symbol: "X" | "O", name?: string) {
    this.id = id;
    this.symbol = symbol;
    this.name = name;
  }
}
