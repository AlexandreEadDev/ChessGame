import { useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { initialBoard } from "../PieceModels/Constant.jsx";
import { Piece } from "../PieceModels/Piece.jsx";

export default function Referee() {
  const [board, setBoard] = useState(initialBoard.clone());
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [checkMateOpen, setCheckMateOpen] = useState(false);
  const [promotionPawn, setPromotionPawn] = useState();
  const [takenPieces, setTakenPieces] = useState([]);
  const [halfMoveClock, setHalfMoveClock] = useState(0);

  const whiteTakenPieces = takenPieces.filter(
    (piece) => piece.team === "WHITE"
  );
  const blackTakenPieces = takenPieces.filter(
    (piece) => piece.team === "BLACK"
  );

  const boardToFEN = (board) => {
    let fen = "";
    let emptyCount = 0;

    for (let y = 7; y >= 0; y--) {
      for (let x = 0; x < 8; x++) {
        let piece = null;
        for (let p of board.pieces) {
          if (p.position.x === x && p.position.y === y) {
            piece = p;
            break;
          }
        }
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen +=
            piece.team === "WHITE"
              ? piece.type === "KNIGHT"
                ? "N"
                : piece.type.charAt(0)
              : piece.type === "KNIGHT"
              ? "n"
              : piece.type.toLowerCase().charAt(0);
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      if (y > 0) {
        fen += "/";
      }
    }

    fen += ` ${board.currentTeam === "WHITE" ? "w" : "b"} `;

    // Castling availability
    const castlingFlags = getCastlingFlags(board);
    fen += `${castlingFlags.length === 0 ? "-" : castlingFlags.join("")}`;

    // En passant target square
    const enPassantTarget = getEnPassantTarget(board);
    fen += ` ${enPassantTarget ? enPassantTarget : "-"} `;

    // Half-move clock

    fen += `${halfMoveClock} ${Math.floor(board.totalTurns)}`;
    return fen;
  };

  const getCastlingFlags = (board) => {
    const castlingFlags = [];

    if (
      board.pieces.some(
        (piece) =>
          piece.type === "KING" && piece.team === "WHITE" && !piece.hasMoved
      )
    ) {
      if (
        board.pieces.some(
          (piece) =>
            piece.type === "ROOK" &&
            piece.team === "WHITE" &&
            piece.position.x === 7 &&
            !piece.hasMoved
        )
      ) {
        castlingFlags.push("K");
      }
      if (
        board.pieces.some(
          (piece) =>
            piece.type === "ROOK" &&
            piece.team === "WHITE" &&
            piece.position.x === 0 &&
            !piece.hasMoved
        )
      ) {
        castlingFlags.push("Q");
      }
    }

    if (
      board.pieces.some(
        (piece) =>
          piece.type === "KING" && piece.team === "BLACK" && !piece.hasMoved
      )
    ) {
      if (
        board.pieces.some(
          (piece) =>
            piece.type === "ROOK" &&
            piece.team === "BLACK" &&
            piece.position.x === 7 &&
            !piece.hasMoved
        )
      ) {
        castlingFlags.push("k");
      }
      if (
        board.pieces.some(
          (piece) =>
            piece.type === "ROOK" &&
            piece.team === "BLACK" &&
            piece.position.x === 0 &&
            !piece.hasMoved
        )
      ) {
        castlingFlags.push("q");
      }
    }

    return castlingFlags;
  };

  const getEnPassantTarget = (board) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    for (let piece of board.pieces) {
      if (piece.type === "PAWN" && piece.enPassant) {
        // Determine the target square based on the direction of the pawn
        const targetX = files[piece.position.x];
        const targetY =
          piece.team === "WHITE" ? piece.position.y - 1 : piece.position.y + 1;
        return `${targetX}${targetY + 1}`;
      }
    }
    return null;
  };

  const fen = boardToFEN(board);
  console.log(fen);

  function playMove(playedPiece, destination) {
    if (playedPiece.possibleMoves === undefined) return false;

    // Prevent the inactive team from playing
    if (playedPiece.team === "WHITE" && !Number.isInteger(board.totalTurns))
      return false;
    if (playedPiece.team === "BLACK" && Number.isInteger(board.totalTurns))
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
      clonedBoard.totalTurns += 0.5;
      playedMoveIsValid = clonedBoard.playMove(
        enPassantMove,
        validMove,
        playedPiece,
        destination,
        setTakenPieces,
        setHalfMoveClock
      );

      if (clonedBoard.winningTeam !== undefined) {
        setCheckMateOpen(true);
      }

      return clonedBoard;
    });

    let promotionRow = playedPiece.team === "WHITE" ? 7 : 0;

    if (destination.y === promotionRow && playedPiece.isPawn) {
      setPromotionOpen(true);
      setPromotionPawn(() => {
        const clonedPlayedPiece = playedPiece.clone();
        clonedPlayedPiece.position = destination.clone();
        return clonedPlayedPiece;
      });
    }

    updateBoard(newBoard);
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
    setBoard(() => {
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

  function restartGame() {
    setCheckMateOpen(false);
    setTakenPieces([]);
    setBoard(initialBoard.clone());
  }

  function renderTakenPiecesColumns(takenPieces) {
    const columns = [];
    const numPieces = takenPieces.length;

    // Calculate the number of columns needed
    const numColumns = Math.ceil(numPieces / 6);

    // Render each column
    for (let i = 0; i < numColumns; i++) {
      const startIndex = i * 5;
      const endIndex = Math.min(startIndex + 5, numPieces);

      columns.push(
        <ul key={i}>
          {takenPieces.slice(startIndex, endIndex).map((piece, index) => (
            <li className="" key={index}>
              <img className="w-12" src={piece.image} alt={piece.type} />
            </li>
          ))}
        </ul>
      );
    }

    return columns;
  }

  const team = Number.isInteger(board.totalTurns) ? "White" : "Black";

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
      {checkMateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="flex items-center justify-center flex-col">
              <span className="block mb-4">
                The winning team is{" "}
                {(board.winningTeam === team) === "WHITE" ? "white" : "black"}!
              </span>
              <button
                onClick={restartGame}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Play again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <> </>
      )}
      <div className=" w-screen items-center justify-center gap-6 flex">
        <div className=" flex flex-col gap-6">
          <p className=" text-white text-2xl">
            {Math.floor(board.totalTurns)} {team}
          </p>
          <Board
            playMove={playMove}
            pieces={board.pieces}
            promotionOpen={promotionOpen}
          />
        </div>
        <div className="h-full mt-10 lg:w-[50%] w-[20%] flex flex-col justify-between pt-8 pb-5">
          <div className=" flex">
            {renderTakenPiecesColumns(whiteTakenPieces)}
          </div>
          <div className=" flex">
            {renderTakenPiecesColumns(blackTakenPieces)}
          </div>
        </div>
      </div>
    </>
  );
}
