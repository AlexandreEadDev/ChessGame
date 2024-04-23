export const tileIsOccupied = (position, boardState) => {
  const piece = boardState.find((p) => p.samePosition(position));
  if (piece) {
    return true;
  } else {
    return false;
  }
};
export const tileIsOccupiedByOppo = (position, boardState, team) => {
  const piece = boardState.find(
    (p) => p.samePosition(position) && p.team !== team
  );
  if (piece) {
    return true;
  } else {
    return false;
  }
};

export const tileIsEmptyOrOccupiedByOppo = (position, boardState, team) => {
  return (
    !tileIsOccupied(position, boardState) ||
    tileIsOccupiedByOppo(position, boardState, team)
  );
};
