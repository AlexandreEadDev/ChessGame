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
    setHalfMoveClock,
    botIsActivate
  ) {
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;
    const destinationPiece = this.pieces.find((p) =>
      p.samePosition(destination)
    );

    if (
      (playedPiece.isPawn &&
        playedPiece.team === "WHITE" &&
        destination.y === 7) ||
      (playedPiece.team === "BLACK" && destination.y === 0)
    ) {
      if (botIsActivate) {
        // Remove the pawn and push the new queen piece
        this.pieces = this.pieces.reduce((results, piece) => {
          if (piece.samePiecePosition(playedPiece)) {
            // Create a new queen piece in the same position
            const queenPiece = new Piece(
              piece.position.clone(), // Correctly pass position
              "QUEEN",
              piece.team,
              true, // hasMoved
              piece.possibleMoves // Keep possible moves
            );
            results.push(queenPiece);
            console.log(
              "there is a promotion. Pawn change into default option that is QUEEN"
            );
          } else if (!piece.samePosition(destination)) {
            if (piece.isPawn) {
              piece.enPassant = false;
            }

            results.push(piece);
          }
          return results;
        }, []);
      }
    }

    if (
      playedPiece.isKing &&
      destinationPiece?.isRook &&
      destinationPiece.team === playedPiece.team
    ) {
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

    if (destinationPiece && destinationPiece.team !== playedPiece.team) {
      setTakenPieces((prevTakenPieces) => [
        ...prevTakenPieces,
        destinationPiece,
      ]);
    }

    if (
      (destinationPiece && destinationPiece.team !== playedPiece.team) ||
      playedPiece.isPawn
    ) {
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

      if (enPassantPawn) {
        setTakenPieces((prevTakenPieces) => [
          ...prevTakenPieces,
          enPassantPawn,
        ]);
      }

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
