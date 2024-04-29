import { useEffect, useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { initialBoard } from "../PieceModels/Constant.jsx";
import { Piece } from "../PieceModels/Piece.jsx";

export default function Referee() {
  const [board, setBoard] = useState(initialBoard);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionPawn, setPromotionPawn] = useState();

  useEffect(() => {
    board.calculateAllMoves();
  }, []);

  function playMove(playedPiece, destination) {
    if (playedPiece.possibleMoves === undefined) return false;

    // Prevent the inactive team from playing
    if (playedPiece.team === "WHITE" && board.totalTurns % 2 !== 1)
      return false;
    if (playedPiece.team === "BLACK" && board.totalTurns % 2 !== 0)
      return false;

    let playedMoveIsValid = false;

    const validMove = playedPiece.possibleMoves?.some((m) =>
      m.samePosition(destination)
    );

    if (!validMove) return false;

    const enPassantMove = isEnPassantMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    setBoard(() => {
      const clonedBoard = board.clone();
      clonedBoard.totalTurns += 1;
      playedMoveIsValid = clonedBoard.playMove(
        enPassantMove,
        validMove,
        playedPiece,
        destination
      );

      return clonedBoard;
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

  function choosePromotion(type) {
    if (promotionPawn === undefined) {
      return;
    }
    setBoard((previousBoard) => {
      const clonedBoard = board.clone();
      clonedBoard.pieces = clonedBoard.pieces.reduce((results, piece) => {
        if (piece.samePiecePosition(promotionPawn)) {
          results.push(
            new Piece(piece.position.clone(), type, piece.team, true)
          );
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

  const team = board.totalTurns % 2 !== 0 ? "White" : "Black";

  return (
    <>
      <p className=" text-white text-2xl">
        {board.totalTurns} {team}
      </p>
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
