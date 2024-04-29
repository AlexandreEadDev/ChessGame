import { Piece } from "./Piece";

export class Pawn extends Piece {
  enPassant;
  constructor(position, team, hasMoved, enPassant, possibleMoves) {
    super(position, "PAWN", team, hasMoved, possibleMoves);
    this.enPassant = enPassant;
  }

  clone() {
    return new Pawn(
      this.position.clone(),
      this.team,
      this.hasMoved,
      this.enPassant,
      this.possibleMoves?.map((m) => m.clone())
    );
  }
}
