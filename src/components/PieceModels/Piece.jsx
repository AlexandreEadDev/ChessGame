export class Piece {
  image;
  position;
  type;
  team;
  possibleMoves;
  hasMoved;
  constructor(position, type, team, hasMoved, possibleMoves) {
    this.image = `assets/${team.toLowerCase()}-${type.toLowerCase()}.png`;
    this.position = position;
    this.type = type;
    this.team = team;
    this.hasMoved = hasMoved;
    this.possibleMoves = possibleMoves;
  }

  get isPawn() {
    return this.type === "PAWN";
  }
  get isRook() {
    return this.type === "ROOK";
  }
  get isKnight() {
    return this.type === "KNIGHT";
  }
  get isBishop() {
    return this.type === "BISHOP";
  }
  get isKing() {
    return this.type === "KING";
  }
  get isQueen() {
    return this.type === "QUEEN";
  }

  samePiecePosition(otherPiece) {
    return this.position.samePosition(otherPiece.position);
  }
  samePosition(otherPosition) {
    return this.position.samePosition(otherPosition);
  }

  clone() {
    return new Piece(
      this.position.clone(),
      this.type,
      this.team,
      this.hasMoved,
      this.possibleMoves?.map((move) => move.clone())
    );
  }
}
