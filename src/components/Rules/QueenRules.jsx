import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

export const queenMove = (prevPosition, nextPosition, team, boardState) => {
  // Check for vertical movement
  if (prevPosition.x === nextPosition.x) {
    const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
    let posY = prevPosition.y + directionY;
    while (posY !== nextPosition.y) {
      if (tileIsOccupied({ x: prevPosition.x, y: posY }, boardState)) {
        return false;
      }
      posY += directionY;
    }
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }

  // Check for horizontal movement
  if (prevPosition.y === nextPosition.y) {
    const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
    let posX = prevPosition.x + directionX;
    while (posX !== nextPosition.x) {
      if (tileIsOccupied({ x: posX, y: prevPosition.y }, boardState)) {
        return false;
      }
      posX += directionX;
    }
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }

  const isDiagonalMove =
    Math.abs(prevPosition.x - nextPosition.x) ===
    Math.abs(prevPosition.y - nextPosition.y);
  // Check for diagonal movement
  if (isDiagonalMove) {
    const directionX = nextPosition.x > prevPosition.x ? 1 : -1;
    const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
    let posX = prevPosition.x + directionX;
    let posY = prevPosition.y + directionY;
    while (posX !== nextPosition.x && posY !== nextPosition.y) {
      if (tileIsOccupied({ x: posX, y: posY }, boardState)) {
        return false;
      }
      posX += directionX;
      posY += directionY;
    }
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }

  return false;
};
