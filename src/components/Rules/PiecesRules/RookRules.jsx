import { Position } from "../../PieceModels/Position";
import {
  tileIsEmptyOrOccupiedByOppo,
  tileIsOccupied,
  tileIsOccupiedByOppo,
} from "../GeneralRules";

const getMovesInDirection = (rook, boardstate, dx, dy) => {
  const possibleMoves = [];
  let x = rook.position.x + dx;
  let y = rook.position.y + dy;

  while (x >= 0 && x < 8 && y >= 0 && y < 8) {
    const destination = new Position(x, y);
    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, rook.team)) {
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

export const rookMove = (prevPosition, nextPosition, team, boardState) => {
  const dx = Math.sign(nextPosition.x - prevPosition.x);
  const dy = Math.sign(nextPosition.y - prevPosition.y);

  if (prevPosition.x === nextPosition.x || prevPosition.y === nextPosition.y) {
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

export const getPossibleRookMoves = (rook, boardstate) => {
  const possibleMoves = [];

  // Define all four cardinal directions
  const directions = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];

  // Iterate over each direction
  for (const [dx, dy] of directions) {
    possibleMoves.push(...getMovesInDirection(rook, boardstate, dx, dy));
  }

  return possibleMoves;
};
