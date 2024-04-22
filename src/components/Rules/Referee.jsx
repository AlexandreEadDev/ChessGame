import { useEffect, useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { initialPieceState } from "../PieceModels/Constant.jsx";
import { getPossiblePawnMoves, pawnMove } from "./PiecesRules/PawnRules.jsx";
import {
  getPossibleKightMoves,
  knightMove,
} from "./PiecesRules/KnightRules.jsx";
import {
  bishopMove,
  getPossibleBishopMoves,
} from "./PiecesRules/BishopRules.jsx";
import { getPossibleRookMoves, rookMove } from "./PiecesRules/RookRules.jsx";
import { getPossibleQueenMoves, queenMove } from "./PiecesRules/QueenRules.jsx";
import { getPossibleKingMoves, kingMove } from "./PiecesRules/KingRules.jsx";
import { Position } from "../PieceModels/Position.jsx";

export default function Referee() {
  const [pieces, setPieces] = useState(initialPieceState);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionPawn, setpromotionPawn] = useState();

  useEffect(() => {
    updatePossibleMoves();
  }, []);

  function updatePossibleMoves() {
    setPieces((currentPieces) => {
      return currentPieces.map((p) => {
        p.possibleMoves = getValidMoves(p, currentPieces);
        return p;
      });
    });
  }

  function playMove(playedPiece, destination) {
    const validMove = isValidMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    const isEnPassantMove = enPassantMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );
    const pawnDirection = playedPiece.team === "WHITE" ? 1 : -1;

    if (isEnPassantMove) {
      const updatedPieces = pieces.reduce((results, piece) => {
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
          if (piece.isPawn && piece.team) {
            piece.enPassant = false;
          }
          results.push(piece);
        }
        return results;
      }, []);

      updatePossibleMoves();
      setPieces(updatedPieces);
    } else if (validMove) {
      const updatedPieces = pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(playedPiece)) {
          // EnPassant System
          if (piece.isPawn)
            piece.enPassant =
              Math.abs(playedPiece.position.y - destination.y) === 2 &&
              piece.type === "PAWN";
          piece.position.x = destination.x;
          piece.position.y = destination.y;

          // Promotion System
          let promotionRow = piece.team === "WHITE" ? 7 : 0;
          if (piece.isPawn && destination.y === promotionRow) {
            setPromotionOpen(true);
            setpromotionPawn(piece);
          }

          results.push(piece);
        } else if (
          !piece.samePosition(new Position(destination.x, destination.y))
        ) {
          if (piece.isPawn) {
            piece.enPassant = false;
          }
          results.push(piece);
        }
        return results;
      }, []);

      setPieces(updatedPieces);
      updatePossibleMoves();
    } else {
      return false;
    }
    return true;
  }

  function enPassantMove(prevPosition, nextPosition, type, team) {
    const pawnDirection = team === "WHITE" ? 1 : -1;
    if (type === "PAWN") {
      if (
        (nextPosition.x - prevPosition.x === -1 ||
          nextPosition.x - prevPosition.x === 1) &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        const piece = pieces.find(
          (p) =>
            p.position.x === nextPosition.x &&
            p.position.y === nextPosition.y - pawnDirection &&
            p.isPawn &&
            p.enPassant &&
            p.team !== team
        );
        if (piece) {
          return true;
        }
      }
    }
    return false;
  }

  function isValidMove(prevPosition, nextPosition, type, team) {
    let validMove = false;
    switch (type) {
      case (type = "PAWN"):
        validMove = pawnMove(prevPosition, nextPosition, team, pieces);
        break;
      case (type = "KNIGHT"):
        validMove = knightMove(prevPosition, nextPosition, team, pieces);
        break;
      case (type = "BISHOP"):
        validMove = bishopMove(prevPosition, nextPosition, team, pieces);
        break;
      case (type = "ROOK"):
        validMove = rookMove(prevPosition, nextPosition, team, pieces);
        break;
      case (type = "QUEEN"):
        validMove = queenMove(prevPosition, nextPosition, team, pieces);
        break;
      case (type = "KING"):
        validMove = kingMove(prevPosition, nextPosition, team, pieces);
    }
    return validMove;
  }

  function getValidMoves(piece, boardState) {
    switch (piece.type) {
      case (piece.type = "PAWN"):
        return getPossiblePawnMoves(piece, pieces);
      case (piece.type = "KNIGHT"):
        return getPossibleKightMoves(piece, pieces);
      case (piece.type = "BISHOP"):
        return getPossibleBishopMoves(piece, pieces);
      case (piece.type = "ROOK"):
        return getPossibleRookMoves(piece, pieces);
      case (piece.type = "QUEEN"):
        return getPossibleQueenMoves(piece, pieces);
      case (piece.type = "KING"):
        return getPossibleKingMoves(piece, pieces);
      default:
        return [];
    }
  }

  function choosePromotion(type) {
    if (promotionPawn === undefined) {
      return;
    }
    const updatedPieces = pieces.reduce((results, piece) => {
      if (piece.samePiecePosition(promotionPawn)) {
        piece.type = type;
        piece.image = `assets/${piece.team.toLowerCase()}-${type.toLowerCase()}.png`;
      }
      results.push(piece);
      return results;
    }, []);
    setPieces(updatedPieces);
    setPromotionOpen(false);
    updatePossibleMoves();
  }

  return (
    <>
      {promotionOpen ? (
        <>
          <div
            className={`flex justify-around items-center absolute h-[300px] w-[600px] top-[calc(50%-150px)] left-[calc(50%-300px)] ${
              promotionPawn?.team === "WHITE" ? "bg-black/80" : "bg-white/80"
            }`}
          >
            <img
              onClick={() => choosePromotion("ROOK")}
              className={`h-28 rounded-full hover:cursor-pointer p-2 select-none ${
                promotionPawn?.team === "WHITE"
                  ? "hover:bg-white/50"
                  : "hover:bg-black/50"
              }`}
              src={`assets/${promotionPawn?.team.toLowerCase()}-rook.png`}
            />
            <img
              onClick={() => choosePromotion("BISHOP")}
              className={`h-28 rounded-full hover:cursor-pointer p-2 select-none ${
                promotionPawn?.team === "WHITE"
                  ? "hover:bg-white/50"
                  : "hover:bg-black/50"
              }`}
              src={`assets/${promotionPawn?.team.toLowerCase()}-bishop.png`}
            />
            <img
              onClick={() => choosePromotion("KNIGHT")}
              className={`h-28 rounded-full hover:cursor-pointer p-2 select-none ${
                promotionPawn?.team === "WHITE"
                  ? "hover:bg-white/50"
                  : "hover:bg-black/50"
              }`}
              src={`assets/${promotionPawn?.team.toLowerCase()}-knight.png`}
            />
            <img
              onClick={() => choosePromotion("QUEEN")}
              className={`h-28 rounded-full hover:cursor-pointer p-2 select-none ${
                promotionPawn?.team === "WHITE"
                  ? "hover:bg-white/50"
                  : "hover:bg-black/50"
              }`}
              src={`assets/${promotionPawn?.team.toLowerCase()}-queen.png`}
            />
          </div>
        </>
      ) : (
        <> </>
      )}
      <Board
        playMove={playMove}
        pieces={pieces}
        promotionOpen={promotionOpen}
        setPieces={setPieces}
      />
    </>
  );
}
