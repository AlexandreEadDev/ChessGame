export const tileIsOccupied = (position, boardState) => {
  const piece = boardState.find(
    (p) => p.position.x === position.x && p.position.y === position.y
  );
  if (piece) {
    return true;
  } else {
    return false;
  }
};
export const tileIsOccupiedByOppo = (position, boardState, team) => {
  const piece = boardState.find(
    (p) =>
      p.position.x === position.x &&
      p.position.y === position.y &&
      p.team !== team
  );
  if (piece) {
    return true;
  } else {
    return false;
  }
};
