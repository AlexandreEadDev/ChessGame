import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

export const pawnMove = (prevPosition, nextPosition, team, boardState) => {
  const teamRow = team === 1 ? 1 : 6;
  const pawnDirection = team === 1 ? 1 : -1;

  // MOVEMENT LOGIC
  if (
    prevPosition.x === nextPosition.x &&
    prevPosition.y === teamRow &&
    nextPosition.y - prevPosition.y === 2 * pawnDirection
  ) {
    if (
      !tileIsOccupied(nextPosition, boardState) &&
      !tileIsOccupied(
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
    if (!tileIsOccupied(nextPosition, boardState)) {
      return true;
    }
  }

  // ATTACK LOGIC
  if (
    nextPosition.x - prevPosition.x === -1 &&
    nextPosition.y - prevPosition.y === pawnDirection
  ) {
    if (tileIsOccupiedByOppo(nextPosition, boardState, team)) {
      return true;
    }
  } else if (
    nextPosition.x - prevPosition.x === 1 &&
    nextPosition.y - prevPosition.y === pawnDirection
  ) {
    if (tileIsOccupiedByOppo(nextPosition, boardState, team)) {
      return true;
    }
  }
  return false;
};
