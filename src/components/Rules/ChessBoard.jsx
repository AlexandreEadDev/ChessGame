import { getPossibleBishopMoves } from "./PiecesRules/BishopRules";
import { getPossibleKingMoves } from "./PiecesRules/KingRules";
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
    return this.totalTurns % 2 === 0 ? "BLACK" : "WHITE";
  }

  calculateAllMoves() {
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMoves(piece, this.pieces);
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

  playMove(enPassantMove, validMove, playedPiece, destination) {
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;
    const destinationPiece = this.pieces.find((p) =>
      p.samePosition(destination)
    );
    if (
      playedPiece.isKing &&
      destinationPiece?.isRook &&
      destinationPiece.team === playedPiece.team
    ) {
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

      this.calculateAllMoves();
      return true;
    }

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
    return new ChessBoard(
      this.pieces.map((p) => p.clone()),
      this.totalTurns
    );
  }
}
