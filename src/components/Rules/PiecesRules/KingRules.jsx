import { Position } from "../../PieceModels/Position";
import {
  tileIsEmptyOrOccupiedByOppo,
  tileIsOccupied,
  tileIsOccupiedByOppo,
} from "../GeneralRules";

export const kingMove = (prevPosition, nextPosition, team, boardState) => {
  // ... (cette fonction reste inchangée)
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1], // straight
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1], // diagonal
  ];

  for (const [dx, dy] of directions) {
    let x = prevPosition.x;
    let y = prevPosition.y;

    while (true) {
      x += dx;
      y += dy;

      if (x < 0 || x > 7 || y < 0 || y > 7) break;

      const passedPosition = new Position(x, y);

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
  }

  return false;
};

export const getPossibleKingMoves = (king, boardstate) => {
  // ... (cette fonction reste inchangée)
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
  ];
  const possibleMoves = [];

  for (const [dx, dy] of directions) {
    let x = king.position.x;
    let y = king.position.y;

    for (let i = 1; i < 2; i++) {
      x += dx * i;
      y += dy * i;

      if (x < 0 || x > 7 || y < 0 || y > 7) break;

      const destination = new Position(x, y);

      if (!tileIsOccupied(destination, boardstate)) {
        possibleMoves.push(destination);
      } else if (tileIsOccupiedByOppo(destination, boardstate, king.team)) {
        possibleMoves.push(destination);
        break;
      } else {
        break;
      }
    }
  }

  return possibleMoves;
};

export const getCastlingMoves = (king, boardstate) => {
  if (king.hasMoved) return [];

  const possibleMoves = [];

  const rooks = boardstate.filter(
    (p) => p.isRook && p.team === king.team && !p.hasMoved
  );

  for (const rook of rooks) {
    const direction = rook.position.x - king.position.x > 0 ? 1 : -1;
    const adjacentX = king.position.x + direction;

    if (
      !rook.possibleMoves?.some(
        (m) => m.x === adjacentX && m.y === king.position.y
      )
    )
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

    // --- MODIFICATION ICI ---
    // On retourne la case de destination du roi (2 cases de déplacement)
    // au lieu de la case de la tour.
    const newKingPosition = new Position(
      king.position.x + direction * 2,
      king.position.y
    );
    possibleMoves.push(newKingPosition);
  }

  return possibleMoves;
};
