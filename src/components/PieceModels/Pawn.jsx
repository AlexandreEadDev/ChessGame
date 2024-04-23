import { Piece } from "./Piece";

export class Pawn extends Piece {
  enPassant;
  constructor(position, team, enPassant, possibleMoves) {
    super(position, "PAWN", team, possibleMoves);
    this.enPassant = enPassant;
  }

  clone() {
    return new Pawn(
      this.position.clone(),
      this.team,
      this.enPassant,
      this.possibleMoves?.map((m) => m.clone())
    );
  }
}
