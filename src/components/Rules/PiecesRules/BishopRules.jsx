import { Position } from "../../PieceModels/Position";
import {
  tileIsEmptyOrOccupiedByOppo,
  tileIsOccupied,
  tileIsOccupiedByOppo,
} from "../GeneralRules";

const getMovesInDirection = (bishop, boardstate, dx, dy) => {
  const possibleMoves = [];
  let x = bishop.position.x + dx;
  let y = bishop.position.y + dy;

  while (x >= 0 && x < 8 && y >= 0 && y < 8) {
    const destination = new Position(x, y);
    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, bishop.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
    x += dx;
    y += dy;
  }

  return possibleMoves;
};

export const bishopMove = (prevPosition, nextPosition, team, boardState) => {
  const dx = Math.sign(nextPosition.x - prevPosition.x);
  const dy = Math.sign(nextPosition.y - prevPosition.y);

  if (
    Math.abs(nextPosition.x - prevPosition.x) ===
    Math.abs(nextPosition.y - prevPosition.y)
  ) {
    return getMovesInDirection(
      { position: prevPosition, team },
      boardState,
      dx,
      dy
    ).some(
      (move) =>
        move.samePosition(nextPosition) &&
        tileIsEmptyOrOccupiedByOppo(move, boardState, team)
    );
  }

  return false;
};

export const getPossibleBishopMoves = (bishop, boardstate) => {
  const possibleMoves = [];

  // Define all four diagonal directions
  const directions = [
    [1, 1],
    [1, -1],
    [-1, -1],
    [-1, 1],
  ];

  // Iterate over each direction
  for (const [dx, dy] of directions) {
    possibleMoves.push(...getMovesInDirection(bishop, boardstate, dx, dy));
  }

  return possibleMoves;
};
