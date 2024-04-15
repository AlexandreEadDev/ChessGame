import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

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
