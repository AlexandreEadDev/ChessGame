import { Position } from "../../PieceModels/Position";
import { tileIsOccupied, tileIsOccupiedByOppo } from "../GeneralRules";

export const kingMove = (prevPosition, nextPosition, team, boardState) => {
  // Check if the movement is within one tile in any direction
  const isWithinOneTile =
    Math.abs(prevPosition.x - nextPosition.x) <= 1 &&
    Math.abs(prevPosition.y - nextPosition.y) <= 1;
  if (isWithinOneTile) {
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }
  return false;
};

export const getPossibleKingMoves = (king, boardstate) => {
  const possibleMoves = [];

  const directions = [
    { dx: 1, dy: 1 }, // Upper right
    { dx: 1, dy: -1 }, // Bottom right
    { dx: -1, dy: 1 }, // Upper left
    { dx: -1, dy: -1 }, // Bottom left
    { dx: 0, dy: 1 }, // Top
    { dx: 0, dy: -1 }, // Bottom
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }, // Right
  ];

  directions.forEach(({ dx, dy }) => {
    const destination = new Position(
      king.position.x + dx,
      king.position.y + dy
    );

    // Check if move is inside the board
    if (
      destination.x >= 0 &&
      destination.x < 8 &&
      destination.y >= 0 &&
      destination.y < 8
    ) {
      if (!tileIsOccupied(destination, boardstate)) {
        possibleMoves.push(destination);
      } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
        possibleMoves.push(destination);
      }
    }
  });

  return possibleMoves;
};
