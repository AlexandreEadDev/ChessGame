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
    if (!Number.isInteger(this.totalTurns)) {
      return "BLACK";
    } else {
      return "WHITE";
    }
  }

  calculateAllMoves() {
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
    for (const piece of this.pieces.filter(
      (p) => p.team === this.currentTeam
    )) {
      if (piece.possibleMoves === undefined) continue;

      for (const move of piece.possibleMoves) {
        const simulatedChessBoard = this.clone();

        simulatedChessBoard.pieces = simulatedChessBoard.pieces.filter(
          (p) => !p.samePosition(move)
        );

        const clonedPiece = simulatedChessBoard.pieces.find((p) =>
          p.samePiecePosition(piece)
        );
        if (!clonedPiece) continue;
        clonedPiece.position = move.clone();
        const clonedKing = simulatedChessBoard.pieces.find(
          (p) => p.isKing && p.team === simulatedChessBoard.currentTeam
        );
        if (!clonedKing) continue;

        for (const enemy of simulatedChessBoard.pieces.filter(
          (p) => p.team !== simulatedChessBoard.currentTeam
        )) {
          enemy.possibleMoves = simulatedChessBoard.getValidMoves(
            enemy,
            simulatedChessBoard.pieces
          );

          if (enemy.isPawn) {
            if (
              enemy.possibleMoves.some(
                (m) =>
                  m.x !== enemy.position.x &&
                  m.samePosition(clonedKing.position)
              )
            ) {
              piece.possibleMoves = piece.possibleMoves?.filter(
                (m) => !m.samePosition(move)
              );
            }
          } else {
            if (
              enemy.possibleMoves.some((m) =>
                m.samePosition(clonedKing.position)
              )
            ) {
              piece.possibleMoves = piece.possibleMoves?.filter(
                (m) => !m.samePosition(move)
              );
            }
          }
        }
      }
    }
  }

  getValidMoves(piece, ChessBoardState) {
    switch (piece.type) {
      case (piece.type = "PAWN"):
        return getPossiblePawnMoves(piece, ChessBoardState);
      case (piece.type = "KNIGHT"):
        return getPossibleKnightMoves(piece, ChessBoardState);
      case (piece.type = "BISHOP"):
        return getPossibleBishopMoves(piece, ChessBoardState);
      case (piece.type = "ROOK"):
        return getPossibleRookMoves(piece, ChessBoardState);
      case (piece.type = "QUEEN"):
        return getPossibleQueenMoves(piece, ChessBoardState);
      case (piece.type = "KING"):
        return getPossibleKingMoves(piece, ChessBoardState);
      default:
        return [];
    }
  }

  playMove(
    enPassantMove,
    validMove,
    playedPiece,
    destination,
    setTakenPieces,
    setHalfMoveClock
  ) {
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;
    const destinationPiece = this.pieces.find((p) =>
      p.samePosition(destination)
    );

    if (
      playedPiece.isKing &&
      destinationPiece?.isRook &&
      destinationPiece.team === playedPiece.team
    ) {
      // Check if the move is a castling move
      if (!validMove) {
        this.pieces = this.pieces.map((p) => {
          if (p.samePiecePosition(playedPiece)) {
            p.position.x = destination.x;
          } else if (!p.samePiecePosition(destinationPiece)) {
            return p;
          }
          return p;
        });
        return true;
      } else {
        const direction =
          destinationPiece.position.x - playedPiece.position.x > 0 ? 1 : -1;
        const newKingXPosition = playedPiece.position.x + direction * 2;
        this.pieces = this.pieces.map((p) => {
          if (p.samePiecePosition(playedPiece)) {
            p.position.x = newKingXPosition;
          } else if (p.samePiecePosition(destinationPiece)) {
            p.position.x = newKingXPosition - direction;
          }
          return p;
        });
      }
    }

    // Check if a piece is taken by the move and it's not a rook
    if (destinationPiece && destinationPiece.team !== playedPiece.team) {
      setTakenPieces((prevTakenPieces) => [
        ...prevTakenPieces,
        destinationPiece,
      ]);
    }

    if (destinationPiece || playedPiece.isPawn) {
      setHalfMoveClock(0);
    } else {
      setHalfMoveClock((prevHalfMoveClock) => prevHalfMoveClock + 1);
    }

    if (enPassantMove) {
      const enPassantPawn = this.pieces.find(
        (p) =>
          p.isPawn &&
          p.position.x === destination.x &&
          p.position.y === destination.y - pawnDirection
      );

      // Add the en passant pawn to taken pieces
      if (enPassantPawn) {
        setTakenPieces((prevTakenPieces) => [
          ...prevTakenPieces,
          enPassantPawn,
        ]);
      }

      // Update board state after en passant move
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          if (piece.isPawn) piece.enPassant = false;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (
          !piece.samePosition(
            new Position(destination.x, destination.y - pawnDirection)
          )
        ) {
          if (piece.isPawn) {
            piece.enPassant = false;
          }
          results.push(piece);
        }

        return results;
      }, []);

      this.calculateAllMoves();
    } else if (validMove) {
      // Update board state after a regular move
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          // SPECIAL MOVE
          if (piece.isPawn)
            piece.enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2 &&
              piece.type === "PAWN";
          piece.position.x = destination.x;
          piece.position.y = destination.y;
          piece.hasMoved = true;
          results.push(piece);
        } else if (!piece.samePosition(destination)) {
          if (piece.isPawn) {
            piece.enPassant = false;
          }
          results.push(piece);
        }
        return results;
      }, []);

      this.calculateAllMoves();
    } else {
      return false;
    }

    return true;
  }

  clone() {
    return new ChessBoard(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }
}
