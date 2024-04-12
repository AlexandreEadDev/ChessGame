export default class Referee {
  tileIsEmptyOrOccupiedByOppo(position, boardState, team) {
    return (
      !this.tileIsOccupied(position, boardState) ||
      this.tileIsOccupiedByOppo(position, boardState, team)
    );
  }
  tileIsOccupied(position, boardState) {
    const piece = boardState.find(
      (p) => p.position.x === position.x && p.position.y === position.y
    );
    if (piece) {
      return true;
    } else {
      return false;
    }
  }
  tileIsOccupiedByOppo(position, boardState, team) {
    const piece = boardState.find(
      (p) =>
        p.position.x === position.x &&
        p.position.y === position.y &&
        p.team !== team
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

  // Pieces Rules
  pawnMove(prevPosition, nextPosition, team, boardState) {
    const teamRow = team === 1 ? 1 : 6;
    const pawnDirection = team === 1 ? 1 : -1;

    // MOVEMENT LOGIC
    if (
      prevPosition.x === nextPosition.x &&
      prevPosition.y === teamRow &&
      nextPosition.y - prevPosition.y === 2 * pawnDirection
    ) {
      if (
        !this.tileIsOccupied(nextPosition, boardState) &&
        !this.tileIsOccupied(
          { x: nextPosition.x, y: nextPosition.y - pawnDirection },
          boardState
        )
      ) {
        return true;
      }
    } else if (
      prevPosition.x === nextPosition.x &&
      nextPosition.y - prevPosition.y === pawnDirection
    ) {
      if (!this.tileIsOccupied(nextPosition, boardState)) {
        return true;
      }
    }

    // ATTACK LOGIC
    if (
      nextPosition.x - prevPosition.x === -1 &&
      nextPosition.y - prevPosition.y === pawnDirection
    ) {
      if (this.tileIsOccupiedByOppo(nextPosition, boardState, team)) {
        return true;
      }
    } else if (
      nextPosition.x - prevPosition.x === 1 &&
      nextPosition.y - prevPosition.y === pawnDirection
    ) {
      if (this.tileIsOccupiedByOppo(nextPosition, boardState, team)) {
        return true;
      }
    }
    return false;
  }
  kightMove(prevPosition, nextPosition, team, boardState) {
    // MOVEMENT LOGIC
    for (let i = -1; i < 2; i += 2) {
      for (let j = -1; j < 2; j += 2) {
        // TOP/BOTTOM MOVEMENT
        if (nextPosition.y - prevPosition.y === 2 * i) {
          if (nextPosition.x - prevPosition.x === j) {
            if (
              !this.tileIsOccupied(nextPosition, boardState) ||
              this.tileIsOccupiedByOppo(nextPosition, boardState, team)
            ) {
              return true;
            }
          }
        }

        // LEFT/RIGHT MOVEMENT
        if (nextPosition.x - prevPosition.x === 2 * i) {
          if (nextPosition.y - prevPosition.y === j) {
            if (
              !this.tileIsOccupied(nextPosition, boardState) ||
              this.tileIsOccupiedByOppo(nextPosition, boardState, team)
            ) {
              return true;
            }
          }
        }
      }
    }
  }
  bishopMove(prevPosition, nextPosition, team, boardState) {
    // Check for diagonal movement
    const isDiagonalMove =
      Math.abs(prevPosition.x - nextPosition.x) ===
      Math.abs(prevPosition.y - nextPosition.y);
    if (isDiagonalMove) {
      const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
      const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
      let posX = prevPosition.x + directionX;
      let posY = prevPosition.y + directionY;
      while (posX !== nextPosition.x && posY !== nextPosition.y) {
        if (this.tileIsOccupied({ x: posX, y: posY }, boardState)) {
          return false; // Invalid move if the path is blocked
        }
        posX += directionX;
        posY += directionY;
      }
      // No obstacles encountered, and the destination is valid
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }
    return false;
  }
  rookMove(prevPosition, nextPosition, team, boardState) {
    // Check for vertical movement
    if (prevPosition.x === nextPosition.x) {
      const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
      let posY = prevPosition.y + directionY;
      while (posY !== nextPosition.y) {
        if (this.tileIsOccupied({ x: prevPosition.x, y: posY }, boardState)) {
          return false; // Invalid move if the path is blocked
        }
        posY += directionY;
      }
      // No obstacles encountered, and the destination is valid
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }

    // Check for horizontal movement
    if (prevPosition.y === nextPosition.y) {
      const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
      let posX = prevPosition.x + directionX;
      while (posX !== nextPosition.x) {
        if (this.tileIsOccupied({ x: posX, y: prevPosition.y }, boardState)) {
          return false; // Invalid move if the path is blocked
        }
        posX += directionX;
      }
      // No obstacles encountered, and the destination is valid
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }
    return false;
  }
  queenMove(prevPosition, nextPosition, team, boardState) {
    // Check for vertical movement
    if (prevPosition.x === nextPosition.x) {
      const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
      let posY = prevPosition.y + directionY;
      while (posY !== nextPosition.y) {
        if (this.tileIsOccupied({ x: prevPosition.x, y: posY }, boardState)) {
          return false;
        }
        posY += directionY;
      }
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }

    // Check for horizontal movement
    if (prevPosition.y === nextPosition.y) {
      const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
      let posX = prevPosition.x + directionX;
      while (posX !== nextPosition.x) {
        if (this.tileIsOccupied({ x: posX, y: prevPosition.y }, boardState)) {
          return false;
        }
        posX += directionX;
      }
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }

    // Check for diagonal movement
    const isDiagonalMove =
      Math.abs(prevPosition.x - nextPosition.x) ===
      Math.abs(prevPosition.y - nextPosition.y);
    if (isDiagonalMove) {
      const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
      const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
      let posX = prevPosition.x + directionX;
      let posY = prevPosition.y + directionY;
      while (posX !== nextPosition.x && posY !== nextPosition.y) {
        if (this.tileIsOccupied({ x: posX, y: posY }, boardState)) {
          return false; // Invalid move if the path is blocked
        }
        posX += directionX;
        posY += directionY;
      }
      // No obstacles encountered, and the destination is valid
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }

    // Invalid move if none of the conditions above are met
    return false;
  }
  kingMove(prevPosition, nextPosition, team, boardState) {
    // Check if the movement is within one tile in any direction
    const isWithinOneTile =
      Math.abs(prevPosition.x - nextPosition.x) <= 1 &&
      Math.abs(prevPosition.y - nextPosition.y) <= 1;
    if (isWithinOneTile) {
      return (
        !this.tileIsOccupied(nextPosition, boardState) ||
        this.tileIsOccupiedByOppo(nextPosition, boardState, team)
      );
    }
    return false;
  }

  isValidMove(prevPosition, nextPosition, type, team, boardState) {
    let validMove = false;
    switch (type) {
      case (type = "PAWN"):
        validMove = this.pawnMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "KNIGHT"):
        validMove = this.kightMove(
          prevPosition,
          nextPosition,
          team,
          boardState
        );
        break;
      case (type = "BISHOP"):
        validMove = this.bishopMove(
          prevPosition,
          nextPosition,
          team,
          boardState
        );
        break;
      case (type = "ROOK"):
        validMove = this.rookMove(prevPosition, nextPosition, team, boardState);
        break;
      case (type = "QUEEN"):
        validMove = this.queenMove(
          prevPosition,
          nextPosition,
          team,
          boardState
        );
        break;
      case (type = "KING"):
        validMove = this.kingMove(prevPosition, nextPosition, team, boardState);
    }
    return validMove;
  }
}
