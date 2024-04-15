import { bishopMove } from "./Rules/BishopRules";
import { kingMove } from "./Rules/KingRules";
import { knightMove } from "./Rules/KnightRules";
import { pawnMove } from "./Rules/PawnRules";
import { queenMove } from "./Rules/QueenRules";
import { rookMove } from "./Rules/RookRules";

export default class Referee {
  enPassantMove(prevPosition, nextPosition, type, team, boardState) {
    const pawnDirection = team === 1 ? 1 : -1;
    if (type === "PAWN") {
      if (
        (nextPosition.x - prevPosition.x === -1 ||
          nextPosition.x - prevPosition.x === 1) &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        const piece = boardState.find(
          (p) =>
            p.position.x === nextPosition.x &&
            p.position.y === nextPosition.y - pawnDirection &&
            p.enPassant
        );
        if (piece) {
          return true;
        }
      }
    }
    return false;
  }

  isValidMove(prevPosition, nextPosition, type, team, boardState) {
    let validMove = false;
    switch (type) {
      case (type = "PAWN"):
        validMove = pawnMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "KNIGHT"):
        validMove = knightMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "BISHOP"):
        validMove = bishopMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "ROOK"):
        validMove = rookMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "QUEEN"):
        validMove = queenMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "KING"):
        validMove = kingMove(prevPosition, nextPosition, team, boardState);
    }
    return validMove;
  }
}
