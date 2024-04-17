import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

export const rookMove = (prevPosition, nextPosition, team, boardState) => {
  // Check for vertical movement
  if (prevPosition.x === nextPosition.x) {
    const directionY = nextPosition.y > prevPosition.y ? 1 : -1;
    let posY = prevPosition.y + directionY;
    while (posY !== nextPosition.y) {
      if (tileIsOccupied({ x: prevPosition.x, y: posY }, boardState)) {
        return false; // Invalid move if the path is blocked
      }
      posY += directionY;
    }
    // No obstacles encountered, and the destination is valid
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
        return false; // Invalid move if the path is blocked
      }
      posX += directionX;
    }
    // No obstacles encountered, and the destination is valid
    return (
      !tileIsOccupied(nextPosition, boardState) ||
      tileIsOccupiedByOppo(nextPosition, boardState, team)
    );
  }
  return false;
};

export const getPossibleRookMoves = (rook, boardstate) => {
  const possibleMoves = [];

  const directions = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  directions.forEach(({ dx, dy }) => {
    for (let i = 1; i < 8; i++) {
      const destination = {
        x: rook.position.x + dx * i,
        y: rook.position.y + dy * i,
      };

      if (
        destination.x < 0 ||
        destination.x > 7 ||
        destination.y < 0 ||
        destination.y > 7
      )
        break;

      if (!tileIsOccupied(destination, boardstate)) {
        possibleMoves.push(destination);
      } else if (tileIsOccupiedByOppo(destination, boardstate, rook.team)) {
        possibleMoves.push(destination);
        break;
      } else {
        break;
      }
    }
  });

  return possibleMoves;
};
