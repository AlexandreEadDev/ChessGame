import { Position } from "../../PieceModels/Position";
import {
  tileIsEmptyOrOccupiedByOppo,
  tileIsOccupied,
  tileIsOccupiedByOppo,
} from "../GeneralRules";

const getMovesInDirection = (queen, boardstate, dx, dy) => {
  const possibleMoves = [];
  let x = queen.position.x + dx;
  let y = queen.position.y + dy;

  while (x >= 0 && x < 8 && y >= 0 && y < 8) {
    const destination = new Position(x, y);
    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, queen.team)) {
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

export const queenMove = (prevPosition, nextPosition, team, boardState) => {
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
  } else if (
    nextPosition.x === prevPosition.x ||
    nextPosition.y === prevPosition.y
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

export const getPossibleQueenMoves = (queen, boardstate) => {
  const possibleMoves = [];

  // Define all eight directions
  const directions = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1], // horizontal and vertical
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1], // diagonal
  ];

  // Iterate over each direction
  for (const [dx, dy] of directions) {
    possibleMoves.push(...getMovesInDirection(queen, boardstate, dx, dy));
  }

  return possibleMoves;
};
