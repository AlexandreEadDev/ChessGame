export class Piece {
  image;
  position;
  type;
  team;
  enPassant;
  possibleMoves;

  constructor(position, type, team, possibleMoves) {
    this.image = `assets/${team.toLowerCase()}-${type.toLowerCase()}.png`;
    this.position = position;
    this.type = type;
    this.team = team;
    this.possibleMoves = possibleMoves;
  }
}
