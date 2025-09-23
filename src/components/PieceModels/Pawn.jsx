import { Piece } from "./Piece";

export class Pawn extends Piece {
  enPassant;

  // **CORRECTION** : Le constructeur accepte maintenant 'type' pour être cohérent.
  constructor(position, type, team, hasMoved, enPassant, possibleMoves) {
    // On appelle le constructeur parent en forçant le type à "PAWN".
    super(position, "PAWN", team, hasMoved, possibleMoves);
    this.enPassant = enPassant;
  }

  clone() {
    // **CORRECTION** : On passe maintenant le type lors du clonage.
    return new Pawn(
      this.position.clone(),
      this.type, // Important pour la cohérence
      this.team,
      this.hasMoved,
      this.enPassant,
      this.possibleMoves?.map((m) => m.clone())
    );
  }
}
