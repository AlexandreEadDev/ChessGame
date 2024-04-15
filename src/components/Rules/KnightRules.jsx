import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

export const knightMove = (prevPosition, nextPosition, team, boardState) => {
  // MOVEMENT LOGIC
  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      // TOP/BOTTOM MOVEMENT
      if (nextPosition.y - prevPosition.y === 2 * i) {
        if (nextPosition.x - prevPosition.x === j) {
          if (
            !tileIsOccupied(nextPosition, boardState) ||
            tileIsOccupiedByOppo(nextPosition, boardState, team)
          ) {
            return true;
          }
        }
      }

      // LEFT/RIGHT MOVEMENT
      if (nextPosition.x - prevPosition.x === 2 * i) {
        if (nextPosition.y - prevPosition.y === j) {
          if (
            !tileIsOccupied(nextPosition, boardState) ||
            tileIsOccupiedByOppo(nextPosition, boardState, team)
          ) {
            return true;
          }
        }
      }
    }
  }
};
