import { Position } from "../../PieceModels/Position";
import { tileIsOccupied, tileIsOccupiedByOppo } from "../GeneralRules";

export const bishopMove = (prevPosition, nextPosition, team, boardState) => {
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
      if (tileIsOccupied(new Position(posX, posY), boardState)) {
        return false; // Invalid move if the path is blocked
      }
      posX += directionX;
      posY += directionY;
    }
    // No obstacles encountered, and the destination is valid
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }
  return false;
};

export const getPossibleBishopMoves = (bishop, boardstate) => {
  const possibleMoves = [];

  const directions = [
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: -1 },
  ];

  directions.forEach(({ dx, dy }) => {
    for (let i = 1; i < 8; i++) {
      const destination = new Position(
        bishop.position.x + dx * i,
        bishop.position.y + dy * i
      );
      if (!tileIsOccupied(destination, boardstate)) {
        possibleMoves.push(destination);
      } else if (tileIsOccupiedByOppo(destination, boardstate, bishop.team)) {
        possibleMoves.push(destination);
        break;
      } else {
        break;
      }
    }
  });

  return possibleMoves;
};
