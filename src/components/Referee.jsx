export default class Referee {
  tileIsOccupied(x, y, boardState) {
    const piece = boardState.find(
      (p) => p.position.x === x && p.position.y === y
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }
  tileIsOccupiedByOppo(x, y, boardState, team) {
    const piece = boardState.find(
      (p) => p.position.x === x && p.position.y === y && p.team !== team
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }
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
    if (type === "PAWN") {
      const teamRow = team === 1 ? 1 : 6;
      const pawnDirection = team === 1 ? 1 : -1;

      // MOVEMENT LOGIC
      if (
        prevPosition.x === nextPosition.x &&
        prevPosition.y === teamRow &&
        nextPosition.y - prevPosition.y === 2 * pawnDirection
      ) {
        if (
          !this.tileIsOccupied(nextPosition.x, nextPosition.y, boardState) &&
          !this.tileIsOccupied(
            nextPosition.x,
            nextPosition.y - pawnDirection,
            boardState
          )
        ) {
          return true;
        }
      } else if (
        prevPosition.x === nextPosition.x &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        if (!this.tileIsOccupied(nextPosition.x, nextPosition.y, boardState)) {
          return true;
        }
      }

      // ATTACK LOGIC
      if (
        nextPosition.x - prevPosition.x === -1 &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        if (
          this.tileIsOccupiedByOppo(
            nextPosition.x,
            nextPosition.y,
            boardState,
            team
          )
        ) {
          return true;
        }
      } else if (
        nextPosition.x - prevPosition.x === 1 &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        if (
          this.tileIsOccupiedByOppo(
            nextPosition.x,
            nextPosition.y,
            boardState,
            team
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
