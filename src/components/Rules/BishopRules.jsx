import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

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
      if (tileIsOccupied({ x: posX, y: posY }, boardState)) {
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
