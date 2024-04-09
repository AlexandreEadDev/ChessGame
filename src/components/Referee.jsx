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
    //MOVEMENT AND ATTACK LOGIC
    for (let i = 1; i < 8; i++) {
      //Up Right Move
      if (nextPosition.x > prevPosition.x && nextPosition.y > prevPosition.y) {
        let passedTiles = { x: prevPosition.x + i, y: prevPosition.y + i };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }

      //Bottom Right Move
      if (nextPosition.x > prevPosition.x && nextPosition.y < prevPosition.y) {
        let passedTiles = { x: prevPosition.x + i, y: prevPosition.y + -i };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }

      //Bottom Left Move
      if (nextPosition.x < prevPosition.x && nextPosition.y < prevPosition.y) {
        let passedTiles = { x: prevPosition.x - i, y: prevPosition.y - i };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }

      //Top Left Move
      if (nextPosition.x < prevPosition.x && nextPosition.y > prevPosition.y) {
        let passedTiles = { x: prevPosition.x - i, y: prevPosition.y + i };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }
    }
  }
  rookMove(prevPosition, nextPosition, team, boardState) {
    if (prevPosition.x === nextPosition.x) {
      for (let i = 1; i < 8; i++) {
        let multiplier = nextPosition.y < prevPosition.y ? -1 : 1;
        let passedTiles = {
          x: prevPosition.x,
          y: prevPosition.y + i * multiplier,
        };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }
    }

    if (prevPosition.y === nextPosition.y) {
      for (let i = 1; i < 8; i++) {
        let multiplier = nextPosition.x < prevPosition.x ? -1 : 1;
        let passedTiles = {
          x: prevPosition.x + i * multiplier,
          y: prevPosition.y,
        };
        if (
          passedTiles.x === nextPosition.x &&
          passedTiles.y === nextPosition.y
        ) {
          if (
            !this.tileIsOccupied(passedTiles, boardState) ||
            this.tileIsOccupiedByOppo(passedTiles, boardState, team)
          ) {
            return true;
          }
        } else {
          if (this.tileIsOccupied(passedTiles, boardState)) {
            break;
          }
        }
      }
    }
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
    }
    return validMove;
  }
}
