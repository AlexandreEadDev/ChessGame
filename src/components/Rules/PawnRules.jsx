import { tileIsOccupied, tileIsOccupiedByOppo } from "./GeneralRules";

export const pawnMove = (prevPosition, nextPosition, team, boardState) => {
  const specialRow = team === 1 ? 1 : 6;
  const pawnDirection = team === 1 ? 1 : -1;

  // MOVEMENT LOGIC
  if (
    prevPosition.x === nextPosition.x &&
    prevPosition.y === specialRow &&
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

export const getPossiblePawnMoves = (pawn, boardState) => {
  const possibleMoves = [];
  const pawnDirection = pawn.team === 1 ? 1 : -1;
  const specialRow = pawn.team === 1 ? 1 : 6;
  const normalMove = { x: pawn.position.x, y: pawn.position.y + pawnDirection };
  const specialMove = {
    x: normalMove.x,
    y: normalMove.y + pawnDirection,
  };
  const upperLeftAttack = {
    x: pawn.position.x - 1,
    y: pawn.position.y + pawnDirection,
  };
  const upperRightAttack = {
    x: pawn.position.x + 1,
    y: pawn.position.y + pawnDirection,
  };
  const leftPosition = { x: pawn.position.x - 1, y: pawn.position.y };
  const rightPosition = { x: pawn.position.x + 1, y: pawn.position.y };

  if (!tileIsOccupied(normalMove, boardState)) {
    possibleMoves.push(normalMove);
    if (
      pawn.position.y === specialRow &&
      !tileIsOccupied(specialMove, boardState)
    ) {
      possibleMoves.push(specialMove);
    }
  }

  if (tileIsOccupiedByOppo(upperLeftAttack, boardState, pawn.team)) {
    possibleMoves.push(upperLeftAttack);
  } else if (!tileIsOccupied(upperLeftAttack, boardState)) {
    const leftPiece = boardState.find(
      (p) => p.position.x === leftPosition.x && p.position.y === leftPosition.y
    );
    if (
      leftPiece != null &&
      leftPiece.type === "PAWN" &&
      leftPiece.enPassant &&
      leftPiece.team !== pawn.team
    ) {
      possibleMoves.push(upperLeftAttack);
    }
  }
  if (tileIsOccupiedByOppo(upperRightAttack, boardState, pawn.team)) {
    possibleMoves.push(upperRightAttack);
  } else if (!tileIsOccupied(upperRightAttack, boardState)) {
    const rightPiece = boardState.find(
      (p) =>
        p.position.x === rightPosition.x && p.position.y === rightPosition.y
    );
    if (
      rightPiece != null &&
      rightPiece.type === "PAWN" &&
      rightPiece.enPassant &&
      rightPiece.team !== pawn.team
    ) {
      possibleMoves.push(upperRightAttack);
    }
  }
  return possibleMoves;
};
