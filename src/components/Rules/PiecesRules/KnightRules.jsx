import { Position } from "../../PieceModels/Position";
import { tileIsEmptyOrOccupiedByOppo } from "../GeneralRules";

export const knightMove = (prevPosition, nextPosition, team, boardState) => {
  // MOVEMENT LOGIC
  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      // TOP/BOTTOM MOVEMENT
      if (nextPosition.y - prevPosition.y === 2 * i) {
        if (nextPosition.x - prevPosition.x === j) {
          if (tileIsEmptyOrOccupiedByOppo(nextPosition, boardState, team)) {
            return true;
          }
        }
      }

      // LEFT/RIGHT MOVEMENT
      if (nextPosition.x - prevPosition.x === 2 * i) {
        if (nextPosition.y - prevPosition.y === j) {
          if (tileIsEmptyOrOccupiedByOppo(nextPosition, boardState, team)) {
            return true;
          }
        }
      }
    }
  }
};

export const getPossibleKnightMoves = (knight, boardState) => {
  const possibleMoves = [];

  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      const verticalMove = new Position(
        knight.position.x + j,
        knight.position.y + i * 2
      );
      const horizontalMove = new Position(
        knight.position.x + i * 2,
        knight.position.y + j
      );
      if (tileIsEmptyOrOccupiedByOppo(verticalMove, boardState, knight.team)) {
        possibleMoves.push(verticalMove);
      }

      if (
        tileIsEmptyOrOccupiedByOppo(horizontalMove, boardState, knight.team)
      ) {
        possibleMoves.push(horizontalMove);
      }
    }
  }

  return possibleMoves;
};
