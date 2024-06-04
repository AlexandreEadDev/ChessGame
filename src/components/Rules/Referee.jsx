import { useEffect, useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faMinus } from "@fortawesome/free-solid-svg-icons";
import { initialBoard } from "../PieceModels/Constant.jsx";
import { Piece } from "../PieceModels/Piece.jsx";
import fenToBoard from "./FenToBoard.jsx";
import axios from "axios";
import { Position } from "../PieceModels/Position.jsx";

export default function Referee() {
  const [board, setBoard] = useState(initialBoard.clone());
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [checkMateOpen, setCheckMateOpen] = useState(false);
  const [promotionPawn, setPromotionPawn] = useState();
  const [takenPieces, setTakenPieces] = useState([]);
  const [halfMoveClock, setHalfMoveClock] = useState(0);
  const [savedBoards, setSavedBoards] = useState([]);
  const [boardName, setBoardName] = useState("");
  const [showBoardNameInput, setShowBoardNameInput] = useState(false);
  const [whiteTakenPieces, setWhiteTakenPieces] = useState([]);
  const [blackTakenPieces, setBlackTakenPieces] = useState([]);
  const [prediction, setPrediction] = useState({
    evaluation: 0,
    bestMove: "e2e4",
  });
  const [level, setLevel] = useState(1);
  const [botIsActivate, setBotIsActivate] = useState(false);
  const [botCheckbox, setBotCheckbox] = useState(false);
  const [botTurn, setBotTurn] = useState(false);
  const [predictedMove, setPredictedMove] = useState(null);
  const [turnDelay, setTurnDelay] = useState(1);

  useEffect(() => {
    const boardsFromLocalStorage = JSON.parse(
      localStorage.getItem("savedChessBoards") || "[]"
    );
    setSavedBoards(boardsFromLocalStorage);

    const whitePieces = takenPieces.filter((piece) => piece.team === "WHITE");
    const blackPieces = takenPieces.filter((piece) => piece.team === "BLACK");
    setWhiteTakenPieces(whitePieces);
    setBlackTakenPieces(blackPieces);
  }, [takenPieces]);

  const handleBotTurn = async () => {
    if (!botTurn) return;

    await playBotMove(prediction.bestMove);

    setBotTurn(false);
  };

  useEffect(() => {
    handleBotTurn();
  }, [botTurn]);

  const handleSavedBoardClick = (fen) => {
    const newBoard = fenToBoard(fen);
    setBoard(newBoard);

    const savedBoardsFromLocalStorage = JSON.parse(
      localStorage.getItem("savedChessBoards") || "[]"
    );
    const savedBoard = savedBoardsFromLocalStorage.find(
      (board) => board.fen === fen
    );
    if (savedBoard) {
      setTakenPieces(savedBoard.takenPieces);
      setHalfMoveClock(savedBoard.halfMoveClock);
      setBoard((prevBoard) => {
        const updatedBoard = prevBoard.clone();
        updatedBoard.totalTurns = savedBoard.totalTurns;
        updatedBoard.calculateAllMoves();
        return updatedBoard;
      });
    }
    evaluatePosition(fen);
  };

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

    // Castling Handle
    const castlingFlags = getCastlingFlags(board);
    fen += `${castlingFlags.length === 0 ? "-" : castlingFlags.join("")}`;

    // En Passant Handle
    const enPassantTarget = getEnPassantTarget(board);
    fen += ` ${enPassantTarget ? enPassantTarget : "-"} `;

    // Half Move Clock Handle
    fen += `${halfMoveClock} ${Math.floor(board.totalTurns)}`;
    return fen;
  };

  const getCastlingFlags = (board) => {
    const castlingFlags = [];
    const castlingConditions = [
      {
        team: "WHITE",
        kingX: 4,
        kingFlag: "K",
        queenFlag: "Q",
        rookKingSideX: 7,
        rookQueenSideX: 0,
      },
      {
        team: "BLACK",
        kingX: 4,
        kingFlag: "k",
        queenFlag: "q",
        rookKingSideX: 7,
        rookQueenSideX: 0,
      },
    ];

    castlingConditions.forEach(
      ({ team, kingX, kingFlag, queenFlag, rookKingSideX, rookQueenSideX }) => {
        const king = board.pieces.find(
          (piece) =>
            piece.type === "KING" &&
            piece.team === team &&
            piece.position.x === kingX &&
            !piece.hasMoved
        );
        if (king) {
          if (
            board.pieces.some(
              (piece) =>
                piece.type === "ROOK" &&
                piece.team === team &&
                piece.position.x === rookKingSideX &&
                !piece.hasMoved
            )
          ) {
            castlingFlags.push(kingFlag);
          }
          if (
            board.pieces.some(
              (piece) =>
                piece.type === "ROOK" &&
                piece.team === team &&
                piece.position.x === rookQueenSideX &&
                !piece.hasMoved
            )
          ) {
            castlingFlags.push(queenFlag);
          }
        }
      }
    );

    return castlingFlags;
  };

  const getEnPassantTarget = (board) => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    for (let piece of board.pieces) {
      if (piece.type === "PAWN" && piece.enPassant) {
        const targetX = files[piece.position.x];
        const targetY =
          piece.team === "WHITE" ? piece.position.y - 1 : piece.position.y + 1;
        return `${targetX}${targetY + 1}`;
      }
    }
    return null;
  };

  const fen = boardToFEN(board);

  const saveBoardToLocalStorage = () => {
    if (savedBoards.length >= 9) {
      return;
    }

    if (!boardName) {
      setShowBoardNameInput(true);
      return;
    }

    const newBoard = {
      name: boardName,
      fen,
      halfMoveClock,
      takenPieces: takenPieces,
      totalTurns: board.totalTurns,
    };
    const newBoards = [...savedBoards, newBoard];

    localStorage.setItem("savedChessBoards", JSON.stringify(newBoards));
    setSavedBoards(newBoards);

    setBoardName("");
    setShowBoardNameInput(false);
  };

  const deleteBoard = (indexToDelete) => {
    const updatedBoards = savedBoards.filter(
      (_, index) => index !== indexToDelete
    );
    localStorage.setItem("savedChessBoards", JSON.stringify(updatedBoards));
    setSavedBoards(updatedBoards);
  };

  const evaluatePosition = async (fen) => {
    try {
      const response = await axios.post("http://192.168.1.16:5000/evaluate", {
        fen,
        level,
      });
      const data = response.data;
      setPrediction({
        evaluation: data.evaluation,
        bestMove: data.best_move,
      });
      setPredictedMove(data.best_move);
    } catch (error) {
      console.error("Error evaluating position:", error);
    }
  };

  function isElementAtPosition(board, x, y) {
    for (let piece of board.pieces) {
      if (piece.position.x === x && piece.position.y === y) {
        return { type: piece.type, team: piece.team };
      }
    }
    return { type: "Empty", team: "None" };
  }

  const playBotMove = async () => {
    const isElementPresentE1 = isElementAtPosition(board, 4, 0);
    const isElementPresentE8 = isElementAtPosition(board, 4, 7);

    if (!predictedMove) return;

    const initPosition = new Position(
      predictedMove.charCodeAt(0) - 97,
      parseInt(predictedMove[1]) - 1
    );

    const nextPosition = new Position(
      predictedMove.charCodeAt(2) - 97,
      parseInt(predictedMove[3]) - 1
    );

    let modifiedMove = predictedMove;

    if (
      isElementPresentE1.type === "KING" &&
      isElementPresentE1.team === "WHITE" &&
      (predictedMove === "e1c1" || predictedMove === "e1g1")
    ) {
      modifiedMove = predictedMove === "e1c1" ? "e1a1" : "e1h1";
      setPredictedMove(modifiedMove);
    }

    if (
      isElementPresentE8.type === "KING" &&
      isElementPresentE8.team === "BLACK" &&
      (predictedMove === "e8c8" || predictedMove === "e8g8")
    ) {
      modifiedMove = predictedMove === "e8c8" ? "e8a8" : "e8h8";
      setPredictedMove(modifiedMove);
    }

    const pieceToMove = board.pieces.find((piece) =>
      piece.position.samePosition(initPosition)
    );

    if (pieceToMove && botIsActivate) {
      setTimeout(async () => {
        playMove(pieceToMove, nextPosition);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPredictedMove(null);
      }, turnDelay);
    }
  };

  useEffect(() => {
    playBotMove();
  }, [predictedMove]);

  function playMove(playedPiece, destination) {
    if (playedPiece.possibleMoves === undefined) return false;

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
      const updatedFEN = boardToFEN(clonedBoard);

      evaluatePosition(updatedFEN);

      return clonedBoard;
    });

    let promotionRow = playedPiece.team === "WHITE" ? 7 : 0;

    if (destination.y === promotionRow && playedPiece.isPawn) {
      if (botIsActivate) {
        setPromotionOpen(false);
      } else {
        setPromotionOpen(true);
        setPromotionPawn(() => {
          const clonedPlayedPiece = playedPiece.clone();
          clonedPlayedPiece.position = destination.clone();
          return clonedPlayedPiece;
        });
      }
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

  function renderTakenPiecesColumns(takenPieces) {
    const columns = [];
    const numPieces = takenPieces.length;

    const numColumns = Math.ceil(numPieces / 6);

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

  function restartGame() {
    setCheckMateOpen(false);
    setTakenPieces([]);
    setBoard(initialBoard.clone());
    setPrediction({
      evaluation: 0,
      bestMove: "e2e4",
    });
    setBotIsActivate(false);
    setBotCheckbox(false);
  }

  const handleChangeLevel = (e) => {
    const selectedLevel = parseInt(e.target.value);
    setLevel(selectedLevel);
  };
  const handleBotCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    setBotIsActivate(isChecked);
    setBotCheckbox(isChecked);
  };

  const team = Number.isInteger(board.totalTurns) ? "White" : "Black";

  return (
    <>
      {showBoardNameInput ? (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded">
            <input
              type="text"
              placeholder="Enter board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="border rounded p-2 mr-2"
            />
            <button
              onClick={saveBoardToLocalStorage}
              className="bg-[#9f4f32] hover:bg-[#9f4f32ae] text-[#ffdfba] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
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
        <div className="h-full mt-10 lg:w-[20%] w-[20%] flex flex-col justify-between pt-8 pb-5 max-w-[144px]">
          <div className=" flex">
            {renderTakenPiecesColumns(whiteTakenPieces)}
          </div>
          <div className=" flex">
            {renderTakenPiecesColumns(blackTakenPieces)}
          </div>
        </div>
        <div className=" flex flex-col justify-center gap-4 items-center">
          <button
            onClick={saveBoardToLocalStorage}
            className="bg-[#9f4f32] hover:bg-[#9f4f32ae] -mb-2 text-[#ffdfba] font-bold text-lg py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save Board
          </button>
          <h2 className=" text-[#ffdfba] text-base">Saved Boards:</h2>
          <ul>
            {savedBoards.map((savedBoard, index) => (
              <li className=" text-white" key={index}>
                {/* Add onClick event to handle board selection */}
                <div className=" flex items-center justify-center gap-2">
                  <div
                    className=" flex items-center justify-center gap-2 cursor-pointer"
                    onClick={() => handleSavedBoardClick(savedBoard.fen)}
                  >
                    {savedBoard.name}
                  </div>
                  <button
                    onClick={() => deleteBoard(index)}
                    className="  flex items-center justify-center w-3 h-3 focus:outline-none focus:shadow-outline"
                  >
                    <FontAwesomeIcon className=" text-red-600" icon={faMinus} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className=" flex items-center flex-col text-[#ffdfba]">
          <div className=" flex justify-center items-center gap-4">
            <label htmlFor="botCheckbox">Activate Bot</label>
            <input
              type="checkbox"
              onChange={handleBotCheckboxChange}
              checked={botCheckbox}
              id="botCheckbox"
            />
          </div>
          <div className=" text-xl ">
            Select Level Bot:{" "}
            <input
              className=" bg-transparent w-6"
              type="number"
              max={3}
              value={level}
              onChange={handleChangeLevel}
            />
          </div>
          <div>Evaluate Position : {prediction?.evaluation}</div>
          <div>Best Next Move : {prediction?.bestMove}</div>
        </div>
      </div>
    </>
  );
}
