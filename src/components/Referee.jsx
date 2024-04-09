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
    } else if (type === "KNIGHT") {
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
    } else if (type === "BISHOP") {
      //MOVEMENT AND ATTACK LOGIC
      for (let i = 1; i < 8; i++) {
        //Up Right Move
        if (
          nextPosition.x > prevPosition.x &&
          nextPosition.y > prevPosition.y
        ) {
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
        if (
          nextPosition.x > prevPosition.x &&
          nextPosition.y < prevPosition.y
        ) {
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
        if (
          nextPosition.x < prevPosition.x &&
          nextPosition.y < prevPosition.y
        ) {
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
        if (
          nextPosition.x < prevPosition.x &&
          nextPosition.y > prevPosition.y
        ) {
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

    return false;
  }
}
