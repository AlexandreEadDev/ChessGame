import { useEffect, useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { initialBoard } from "../PieceModels/Constant.jsx";
import { pawnMove } from "./PiecesRules/PawnRules.jsx";
import { knightMove } from "./PiecesRules/KnightRules.jsx";
import { bishopMove } from "./PiecesRules/BishopRules.jsx";
import { rookMove } from "./PiecesRules/RookRules.jsx";
import { queenMove } from "./PiecesRules/QueenRules.jsx";
import { kingMove } from "./PiecesRules/KingRules.jsx";
import { Piece } from "../PieceModels/Piece.jsx";

export default function Referee() {
  const [board, setBoard] = useState(initialBoard);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionPawn, setPromotionPawn] = useState();

  useEffect(() => {
    updatePossibleMoves();
  }, []);

  function updatePossibleMoves() {
    board.calculateAllMoves();
  }

  function playMove(playedPiece, destination) {
    let playedMoveIsValid = false;

    const validMove = isValidMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    const enPassantMove = isEnPassantMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    setBoard(() => {
      // Playing the move
      playedMoveIsValid = board.playMove(
        enPassantMove,
        validMove,
        playedPiece,
        destination
      );

      return board.clone();
    });

    let promotionRow = playedPiece.team === "WHITE" ? 7 : 0;

    if (destination.y === promotionRow && playedPiece.isPawn) {
      setPromotionOpen(true);
      setPromotionPawn((previousPromotionPawn) => {
        const clonedPlayedPiece = playedPiece.clone();
        clonedPlayedPiece.position = destination.clone();
        return clonedPlayedPiece;
      });
    }
    return playedMoveIsValid;
  }

  function isEnPassantMove(prevPosition, nextPosition, type, team) {
    const pawnDirection = team === "WHITE" ? 1 : -1;
    if (type === "PAWN") {
      if (
        (nextPosition.x - prevPosition.x === -1 ||
          nextPosition.x - prevPosition.x === 1) &&
        nextPosition.y - prevPosition.y === pawnDirection
      ) {
        const piece = board.pieces.find(
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
        validMove = pawnMove(prevPosition, nextPosition, team, board.pieces);
        break;
      case (type = "KNIGHT"):
        validMove = knightMove(prevPosition, nextPosition, team, board.pieces);
        break;
      case (type = "BISHOP"):
        validMove = bishopMove(prevPosition, nextPosition, team, board.pieces);
        break;
      case (type = "ROOK"):
        validMove = rookMove(prevPosition, nextPosition, team, board.pieces);
        break;
      case (type = "QUEEN"):
        validMove = queenMove(prevPosition, nextPosition, team, board.pieces);
        break;
      case (type = "KING"):
        validMove = kingMove(prevPosition, nextPosition, team, board.pieces);
    }
    return validMove;
  }

  function choosePromotion(type) {
    if (promotionPawn === undefined) {
      return;
    }
    setBoard((previousBoard) => {
      const clonedBoard = board.clone();
      clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(promotionPawn)) {
          results.push(new Piece(piece.position.clone(), type, piece.team));
        } else {
          results.push(piece);
        }
        return results;
      }, []);
      clonedBoard.calculateAllMoves();

      return clonedBoard;
    });
    setPromotionOpen(false);
  }

  return (
    <>
      {promotionOpen ? (
        <>
          <div
            className={`flex justify-around items-center absolute h-[300px] w-[600px] top-[calc(50%-150px)] left-[calc(50%-300px)] z-50 ${
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
        pieces={board.pieces}
        promotionOpen={promotionOpen}
      />
    </>
  );
}
