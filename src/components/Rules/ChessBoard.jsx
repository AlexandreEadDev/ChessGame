import { Piece } from "../PieceModels/Piece";
import { Position } from "../PieceModels/Position";
import { getPossibleBishopMoves } from "./PiecesRules/BishopRules";
import {
  getCastlingMoves,
  getPossibleKingMoves,
} from "./PiecesRules/KingRules";
import { getPossibleKnightMoves } from "./PiecesRules/KnightRules";
import { getPossiblePawnMoves } from "./PiecesRules/PawnRules";
import { getPossibleQueenMoves } from "./PiecesRules/QueenRules";
import { getPossibleRookMoves } from "./PiecesRules/RookRules";

export class ChessBoard {
  pieces;
  totalTurns;
  winningTeam;

  constructor(pieces, totalTurns) {
    this.pieces = pieces;
    this.totalTurns = totalTurns;
  }

  get currentTeam() {
    return Number.isInteger(this.totalTurns) ? "WHITE" : "BLACK";
  }

  calculateAllMoves() {
    // ... (cette fonction reste inchangée)
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMoves(piece, this.pieces);
    }

    for (const king of this.pieces.filter((p) => p.isKing)) {
      if (king.possibleMoves === undefined) continue;

      king.possibleMoves = [
        ...king.possibleMoves,
        ...getCastlingMoves(king, this.pieces),
      ];
    }

    this.checkCurrentTeamMoves();

    for (const piece of this.pieces.filter(
      (p) => p.team !== this.currentTeam
    )) {
      piece.possibleMoves = [];
    }

    if (
      this.pieces
        .filter((p) => p.team === this.currentTeam)
        .some(
          (p) => p.possibleMoves !== undefined && p.possibleMoves.length > 0
        )
    )
      return;

    this.winningTeam = this.currentTeam === "WHITE" ? "BLACK" : "WHITE";
  }

  checkCurrentTeamMoves() {
    // ... (cette fonction reste inchangée)
    for (const piece of this.pieces.filter(
      (p) => p.team === this.currentTeam
    )) {
      if (piece.possibleMoves === undefined) continue;

      piece.possibleMoves = piece.possibleMoves.filter((move) => {
        const simulatedBoard = this.clone();
        simulatedBoard.pieces = simulatedBoard.pieces.filter(
          (p) => !p.samePosition(move)
        );

        const clonedPiece = simulatedBoard.pieces.find((p) =>
          p.samePiecePosition(piece)
        );
        if (!clonedPiece) return false;

        clonedPiece.position = move.clone();

        const clonedKing = simulatedBoard.pieces.find(
          (p) => p.isKing && p.team === simulatedBoard.currentTeam
        );
        if (!clonedKing) return false;

        for (const enemy of simulatedBoard.pieces.filter(
          (p) => p.team !== simulatedBoard.currentTeam
        )) {
          enemy.possibleMoves = simulatedBoard.getValidMoves(
            enemy,
            simulatedBoard.pieces
          );

          if (enemy.isPawn) {
            if (
              enemy.possibleMoves.some(
                (m) =>
                  m.x !== enemy.position.x &&
                  m.samePosition(clonedKing.position)
              )
            ) {
              return false;
            }
          } else {
            if (
              enemy.possibleMoves.some((m) =>
                m.samePosition(clonedKing.position)
              )
            ) {
              return false;
            }
          }
        }

        return true;
      });
    }
  }

  getValidMoves(piece, ChessBoardState) {
    // ... (cette fonction reste inchangée)
    switch (piece.type) {
      case "PAWN":
        return getPossiblePawnMoves(piece, ChessBoardState);
      case "KNIGHT":
        return getPossibleKnightMoves(piece, ChessBoardState);
      case "BISHOP":
        return getPossibleBishopMoves(piece, ChessBoardState);
      case "ROOK":
        return getPossibleRookMoves(piece, ChessBoardState);
      case "QUEEN":
        return getPossibleQueenMoves(piece, ChessBoardState);
      case "KING":
        return getPossibleKingMoves(piece, ChessBoardState);
      default:
        return [];
    }
  }

  // --- MÉTHODE playMove ENTIÈREMENT MISE À JOUR ---
  playMove(
    enPassantMove,
    validMove,
    playedPiece,
    destination,
    setTakenPieces,
    setHalfMoveClock,
    botIsActivate
  ) {
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;
    const destinationPiece = this.pieces.find((p) =>
      p.samePosition(destination)
    );

    // Détection du roque par le mouvement du roi de 2 cases
    const isCastlingMove =
      playedPiece.isKing &&
      Math.abs(destination.x - playedPiece.position.x) === 2;

    // Mise à jour de l'horloge des 50 coups et des pièces prises
    if (
      (destinationPiece && destinationPiece.team !== playedPiece.team) ||
      playedPiece.isPawn
    ) {
      setHalfMoveClock(0);
    } else {
      setHalfMoveClock((prevHalfMoveClock) => prevHalfMoveClock + 1);
    }

    if (destinationPiece && destinationPiece.team !== playedPiece.team) {
      setTakenPieces((prevTakenPieces) => [
        ...prevTakenPieces,
        destinationPiece,
      ]);
    }

    if (isCastlingMove) {
      const direction = destination.x - playedPiece.position.x > 0 ? 1 : -1;
      const rookX = direction > 0 ? 7 : 0;

      this.pieces = this.pieces.map((p) => {
        if (p.samePiecePosition(playedPiece)) {
          p.position.x = destination.x;
          p.hasMoved = true;
        } else if (
          p.isRook &&
          p.team === playedPiece.team &&
          p.position.x === rookX &&
          p.position.y === playedPiece.position.y
        ) {
          p.position.x = destination.x - direction;
          p.hasMoved = true;
        }
        return p;
      });
    } else if (enPassantMove) {
      const enPassantPawn = this.pieces.find(
        (p) =>
          p.isPawn &&
          p.position.x === destination.x &&
          p.position.y === destination.y - pawnDirection
      );

      if (enPassantPawn) {
        setTakenPieces((prevTakenPieces) => [
          ...prevTakenPieces,
          enPassantPawn,
        ]);
      }

      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          piece.enPassant = false;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (!piece.samePosition(enPassantPawn.position)) {
          if (piece.isPawn) piece.enPassant = false;
          results.push(piece);
        }
        return results;
      }, []);
    } else if (validMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          if (piece.isPawn)
            piece.enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (!piece.samePosition(destination)) {
          if (piece.isPawn) piece.enPassant = false;
          results.push(piece);
        }
        return results;
      }, []);
    } else {
      return false;
    }

    // Logique de promotion automatique pour le bot
    const promotionRow = playedPiece.team === "WHITE" ? 7 : 0;
    if (playedPiece.isPawn && destination.y === promotionRow) {
      if (botIsActivate && this.currentTeam === "BLACK") {
        const promotedPawn = this.pieces.find(
          (p) => p.samePosition(destination) && p.isPawn
        );
        if (promotedPawn) {
          this.pieces = this.pieces.filter(
            (p) => !p.samePiecePosition(promotedPawn)
          );
          this.pieces.push(
            new Piece(destination.clone(), "QUEEN", playedPiece.team, true)
          );
        }
      }
    }

    this.calculateAllMoves();
    return true;
  }

  clone() {
    return new ChessBoard(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }
}
