import { Position } from "../PieceModels/Position";
import { getPossibleBishopMoves } from "./PiecesRules/BishopRules";
import { getPossibleKingMoves } from "./PiecesRules/KingRules";
import { getPossibleKnightMoves } from "./PiecesRules/KnightRules";
import { getPossiblePawnMoves } from "./PiecesRules/PawnRules";
import { getPossibleQueenMoves } from "./PiecesRules/QueenRules";
import { getPossibleRookMoves } from "./PiecesRules/RookRules";

export class ChessBoard {
  pieces;

  constructor(pieces) {
    this.pieces = pieces;
  }

  calculateAllMoves() {
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMoves(piece, this.pieces);
    }
  }

  getValidMoves(piece, boardState) {
    switch (piece.type) {
      case (piece.type = "PAWN"):
        return getPossiblePawnMoves(piece, boardState);
      case (piece.type = "KNIGHT"):
        return getPossibleKnightMoves(piece, boardState);
      case (piece.type = "BISHOP"):
        return getPossibleBishopMoves(piece, boardState);
      case (piece.type = "ROOK"):
        return getPossibleRookMoves(piece, boardState);
      case (piece.type = "QUEEN"):
        return getPossibleQueenMoves(piece, boardState);
      case (piece.type = "KING"):
        return getPossibleKingMoves(piece, boardState);
      default:
        return [];
    }
  }

  playMove(enPassantMove, validMove, playedPiece, destination) {
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;

    if (enPassantMove) {
      this.pieces = this.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          if (piece.isPawn) piece.enPassant = false;
          piece.position.x = destination.x;
          piece.position.y = destination.y;
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
          //SPECIAL MOVE
          if (piece.isPawn)
            piece.enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2 &&
              piece.type === "PAWN";
          piece.position.x = destination.x;
          piece.position.y = destination.y;
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
    return new ChessBoard(this.pieces.map((p) => p.clone()));
  }
}
