import { Piece } from "./Piece";

export class Pawn extends Piece {
  enPassant;
  constructor(position, team, enPassant, possibleMoves) {
    super(position, "PAWN", team, possibleMoves);
    this.enPassant = enPassant;
  }
}
