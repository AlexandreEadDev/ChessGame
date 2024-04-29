import { Position } from "../../PieceModels/Position";
import {
  tileIsEmptyOrOccupiedByOppo,
  tileIsOccupied,
  tileIsOccupiedByOppo,
} from "../GeneralRules";

export const kingMove = (prevPosition, nextPosition, team, boardState) => {
  for (let i = 1; i < 2; i++) {
    //Diagonal
    let multiplierX =
      nextPosition.x < prevPosition.x
        ? -1
        : nextPosition.x > prevPosition.x
        ? 1
        : 0;
    let multiplierY =
      nextPosition.y < prevPosition.y
        ? -1
        : nextPosition.y > prevPosition.y
        ? 1
        : 0;

    let passedPosition = new Position(
      prevPosition.x + i * multiplierX,
      prevPosition.y + i * multiplierY
    );

    if (passedPosition.samePosition(nextPosition)) {
      if (tileIsEmptyOrOccupiedByOppo(passedPosition, boardState, team)) {
        return true;
      }
    } else {
      if (tileIsOccupied(passedPosition, boardState)) {
        break;
      }
    }
  }
  return false;
};

export const getPossibleKingMoves = (king, boardstate) => {
  const possibleMoves = [];

  // Top movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x, king.position.y + i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Bottom movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x, king.position.y - i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Left movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Right movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Upper right movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y + i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Bottom right movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x + i, king.position.y - i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Bottom left movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y - i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  // Top left movement
  for (let i = 1; i < 2; i++) {
    const destination = new Position(king.position.x - i, king.position.y + i);

    // If the move is outside of the board don't add it
    if (
      destination.x < 0 ||
      destination.x > 7 ||
      destination.y < 0 ||
      destination.y > 7
    ) {
      break;
    }

    if (!tileIsOccupied(destination, boardstate)) {
      possibleMoves.push(destination);
    } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
      possibleMoves.push(destination);
      break;
    } else {
      break;
    }
  }

  return possibleMoves;
};

// In this method the enemy moves have already been calculated
export const getCastlingMoves = (king, boardstate) => {
  const possibleMoves = [];

  if (king.hasMoved) return possibleMoves;

  const rooks = boardstate.filter(
    (p) => p.isRook && p.team === king.team && !p.hasMoved
  );

  for (const rook of rooks) {
    const direction = rook.position.x - king.position.x > 0 ? 1 : -1;

    const adjacentPosition = king.position.clone();
    adjacentPosition.x += direction;

    if (!rook.possibleMoves?.some((m) => m.samePosition(adjacentPosition)))
      continue;

    const conceringTiles = rook.possibleMoves.filter(
      (m) => m.y === king.position.y
    );

    const enemyPieces = boardstate.filter((p) => p.team !== king.team);

    let valid = true;

    for (const enemy of enemyPieces) {
      if (enemy.possibleMoves === undefined) continue;

      for (const move of enemy.possibleMoves) {
        if (conceringTiles.some((t) => t.samePosition(move))) {
          valid = false;
        }

        if (!valid) break;
      }

      if (!valid) break;
    }

    if (!valid) continue;

    possibleMoves.push(rook.position.clone());
  }

  return possibleMoves;
};
