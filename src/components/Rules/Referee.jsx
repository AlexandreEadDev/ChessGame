import { useEffect, useState } from "react";
import Board from "../ChessBoard/Board.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMinus,
  faSave,
  faCog,
  faListAlt,
  faChevronDown,
  faChevronUp,
  faFlag,
  faUndo,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
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
    moveToPlay: "e2e4",
  });
  const [level, setLevel] = useState(1);
  const [botIsActivate, setBotIsActivate] = useState(false);
  const [botCheckbox, setBotCheckbox] = useState(false);
  const [turnDelay, setTurnDelay] = useState(1000);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [optionsView, setOptionsView] = useState("main");

  const [showRecapModal, setShowRecapModal] = useState(false);
  const [recapBoard, setRecapBoard] = useState(null);
  const [ghostMoveDetails, setGhostMoveDetails] = useState(null);

  const team = Number.isInteger(board.totalTurns) ? "White" : "Black";

  const playSound = (soundFile) => {
    try {
      const audio = new Audio(soundFile);
      audio.volume = 0.4;
      audio.play();
    } catch (e) {
      console.error("Impossible de jouer le son.", e);
    }
  };

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

  useEffect(() => {
    // Cette fonction sera appelée à chaque changement du plateau
    const analyzeBoard = async () => {
      const fen = boardToFEN(board);
      const data = await fetchPrediction(fen);

      // On met TOUJOURS à jour l'affichage de la prédiction
      setPrediction({
        evaluation: data.evaluation,
        bestMove: data.best_move,
        moveToPlay: data.move_to_play,
      });

      // MAIS, on ne fait jouer le bot QUE si les conditions sont réunies
      if (botIsActivate && board.currentTeam === "BLACK") {
        playBotMove(data.move_to_play);
      }
    };

    analyzeBoard();
  }, [board]);

  useEffect(() => {
    const lastMove = moveHistory[moveHistory.length - 1];
    if (lastMove && lastMove.bestMove === null) {
      fetchAndRecordBestMove(lastMove.fenBeforeMove);
    }
  }, [moveHistory]);

  useEffect(() => {
    if (checkMateOpen) {
      playSound("/sounds/win.mp3");
    }
  }, [checkMateOpen]);

  function forfeitGame() {
    const winner = board.currentTeam === "WHITE" ? "BLACK" : "WHITE";
    setBoard((prev) => {
      const newBoard = prev.clone();
      newBoard.winningTeam = winner;
      return newBoard;
    });
    setCheckMateOpen(true);
  }

  function undoMove() {
    if (moveHistory.length === 0) return;

    const movesToUndo =
      botIsActivate && moveHistory.length > 1 && board.currentTeam === "WHITE"
        ? 2
        : 1;

    const newHistory = moveHistory.slice(0, moveHistory.length - movesToUndo);
    setMoveHistory(newHistory);

    if (newHistory.length === 0) {
      setBoard(initialBoard.clone());
      setTakenPieces([]);
    } else {
      const lastMove = newHistory[newHistory.length - 1];
      setBoard(fenToBoard(lastMove.fenAfterMove));
      setTakenPieces(lastMove.takenPiecesBeforeMove || []);
    }
  }

  function handleRecapMoveClick(historyEntry) {
    const boardFromFen = fenToBoard(historyEntry.fenAfterMove);
    setRecapBoard(boardFromFen);

    if (
      historyEntry.bestMove &&
      historyEntry.playedMove !== historyEntry.bestMove
    ) {
      const bestMoveFromPos = new Position(
        historyEntry.bestMove.charCodeAt(0) - 97,
        parseInt(historyEntry.bestMove[1]) - 1
      );
      const bestMoveToPos = new Position(
        historyEntry.bestMove.charCodeAt(2) - 97,
        parseInt(historyEntry.bestMove[3]) - 1
      );

      const boardBeforeMove = fenToBoard(historyEntry.fenBeforeMove);
      const pieceThatShouldHaveMoved = boardBeforeMove.pieces.find((p) =>
        p.samePosition(bestMoveFromPos)
      );

      if (pieceThatShouldHaveMoved) {
        setGhostMoveDetails({
          image: pieceThatShouldHaveMoved.image,
          position: bestMoveToPos,
        });
      } else {
        setGhostMoveDetails(null);
      }
    } else {
      setGhostMoveDetails(null);
    }
  }

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
      setTakenPieces(savedBoard.takenPieces || []);
      setHalfMoveClock(savedBoard.halfMoveClock || 0);
      setMoveHistory(savedBoard.moveHistory || []);
      setBoard((prevBoard) => {
        const updatedBoard = prevBoard.clone();
        updatedBoard.totalTurns = savedBoard.totalTurns;
        updatedBoard.calculateAllMoves();
        return updatedBoard;
      });
    }
    setShowSettingsModal(false);
  };

  const boardToFEN = (board) => {
    let fen = "";
    let emptyCount = 0;

    for (let y = 7; y >= 0; y--) {
      for (let x = 0; x < 8; x++) {
        const piece = board.pieces.find(
          (p) => p.position.x === x && p.position.y === y
        );
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          let char = piece.type.charAt(0);
          if (piece.isKnight) char = "N";
          fen +=
            piece.team === "WHITE" ? char.toUpperCase() : char.toLowerCase();
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      if (y > 0) fen += "/";
    }

    fen += ` ${board.currentTeam === "WHITE" ? "w" : "b"}`;
    const castlingFlags = getCastlingFlags(board);
    fen += ` ${castlingFlags.length === 0 ? "-" : castlingFlags.join("")}`;
    const enPassantTarget = getEnPassantTarget(board);
    fen += ` ${enPassantTarget}`;
    fen += ` ${halfMoveClock} ${Math.floor(board.totalTurns)}`;
    return fen;
  };

  const getCastlingFlags = (board) => {
    const flags = [];
    const sides = { K: 7, Q: 0, k: 7, q: 0 };
    const teams = { WHITE: ["K", "Q"], BLACK: ["k", "q"] };

    for (const team of Object.keys(teams)) {
      const king = board.pieces.find(
        (p) => p.isKing && p.team === team && !p.hasMoved
      );
      if (king) {
        for (const flag of teams[team]) {
          const rook = board.pieces.find(
            (p) =>
              p.isRook &&
              p.team === team &&
              p.position.x === sides[flag] &&
              !p.hasMoved
          );
          if (rook) flags.push(flag);
        }
      }
    }
    return flags;
  };

  const getEnPassantTarget = (board) => {
    const files = "abcdefgh";
    const pawn = board.pieces.find((p) => p.isPawn && p.enPassant);
    if (pawn) {
      const rank = pawn.team === "WHITE" ? 3 : 6;
      return `${files[pawn.position.x]}${rank}`;
    }
    return "-";
  };

  const saveBoardToLocalStorage = () => {
    if (savedBoards.length >= 9) return;
    if (!boardName) {
      setShowBoardNameInput(true);
      return;
    }

    const newBoard = {
      name: boardName,
      fen: boardToFEN(board),
      halfMoveClock,
      takenPieces: takenPieces,
      totalTurns: board.totalTurns,
      moveHistory: moveHistory,
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

  const playBotMove = (move) => {
    if (!move || board.currentTeam !== "BLACK" || !botIsActivate) return;

    const initPos = new Position(
      move.charCodeAt(0) - 97,
      parseInt(move[1]) - 1
    );
    const nextPos = new Position(
      move.charCodeAt(2) - 97,
      parseInt(move[3]) - 1
    );

    const pieceToMove = board.pieces.find((p) =>
      p.position.samePosition(initPos)
    );

    if (pieceToMove && !promotionOpen) {
      setTimeout(() => {
        playMove(pieceToMove, nextPos);
      }, turnDelay);
    }
  };

  async function fetchPrediction(fen) {
    try {
      const response = await axios.post(
        "https://evaluatechesspositionfromfen.xyz/evaluate",
        { fen, level },
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      console.error("Error evaluating position:", error.message);
      return { evaluation: 0, best_move: "error", move_to_play: "error" };
    }
  }

  const evaluatePositionAndPlayBotMove = async (fen) => {
    const data = await fetchPrediction(fen);
    setPrediction({
      evaluation: data.evaluation,
      bestMove: data.best_move,
      moveToPlay: data.move_to_play,
    });
    playBotMove(data.move_to_play);
  };

  const fetchAndRecordBestMove = async (fenToAnalyze) => {
    const predictionData = await fetchPrediction(fenToAnalyze);
    const bestMove = predictionData.best_move;

    setMoveHistory((currentHistory) =>
      currentHistory.map((entry) => {
        if (entry.fenBeforeMove === fenToAnalyze) {
          return { ...entry, bestMove: bestMove };
        }
        return entry;
      })
    );
  };

  function generateMoveNotation(
    playedPiece,
    destination,
    isCapture,
    isCastlingMove,
    enPassantMove,
    boardAfterMove
  ) {
    if (isCastlingMove) {
      return destination.x > playedPiece.position.x ? "O-O" : "O-O-O";
    }

    const files = "abcdefgh";
    const ranks = "12345678";
    let notation = "";

    if (playedPiece.type !== "PAWN") {
      notation += playedPiece.isKnight ? "N" : playedPiece.type.charAt(0);
    }

    if (isCapture || enPassantMove) {
      if (playedPiece.isPawn) {
        notation += files[playedPiece.position.x];
      }
      notation += "x";
    }

    notation += files[destination.x] + ranks[destination.y];

    const promotionRow = playedPiece.team === "WHITE" ? 7 : 0;
    if (playedPiece.isPawn && destination.y === promotionRow) {
      notation += "=Q";
    }

    if (boardAfterMove.winningTeam) {
      notation += "#";
    } else {
      const opponentKing = boardAfterMove.pieces.find(
        (p) => p.isKing && p.team !== boardAfterMove.currentTeam
      );
      if (opponentKing) {
        const isCheck = boardAfterMove.pieces
          .filter((p) => p.team === boardAfterMove.currentTeam)
          .some((p) =>
            p.possibleMoves?.some((m) => m.samePosition(opponentKing.position))
          );
        if (isCheck) {
          notation += "+";
        }
      }
    }
    return notation;
  }

  function playMove(playedPiece, destination) {
    if (!playedPiece.possibleMoves?.some((m) => m.samePosition(destination))) {
      if (!playedPiece.position.samePosition(destination)) {
        playSound("/sounds/illegal.mp3");
      }
      return false;
    }

    const takenPiecesBeforeMove = [...takenPieces];
    const fenBeforeMove = boardToFEN(board);

    const isCastlingMove =
      playedPiece.isKing &&
      Math.abs(destination.x - playedPiece.position.x) === 2;
    const isCapture = board.pieces.some(
      (p) => p.samePosition(destination) && p.team !== playedPiece.team
    );
    const enPassantMove = isEnPassantMove(
      playedPiece.position,
      destination,
      playedPiece.type,
      playedPiece.team
    );

    if (isCastlingMove) {
      playSound("/sounds/castle.mp3");
    } else if (isCapture || enPassantMove) {
      playSound("/sounds/capture.mp3");
    } else {
      playSound("/sounds/move.mp3");
    }

    let playedMoveIsValid = false;
    setBoard((prevBoard) => {
      const clonedBoard = prevBoard.clone();
      clonedBoard.totalTurns += 0.5;
      playedMoveIsValid = clonedBoard.playMove(
        enPassantMove,
        true,
        playedPiece,
        destination,
        setTakenPieces,
        setHalfMoveClock,
        botIsActivate
      );

      if (playedMoveIsValid) {
        const moveNotation = generateMoveNotation(
          playedPiece,
          destination,
          isCapture,
          isCastlingMove,
          enPassantMove,
          clonedBoard
        );

        const newHistoryEntry = {
          notation: moveNotation,
          fenAfterMove: boardToFEN(clonedBoard),
          fenBeforeMove: fenBeforeMove,
          bestMove: null,
          playedMove: `${String.fromCharCode(97 + playedPiece.position.x)}${
            playedPiece.position.y + 1
          }${String.fromCharCode(97 + destination.x)}${destination.y + 1}`,
          takenPiecesBeforeMove: takenPiecesBeforeMove,
        };

        setMoveHistory((prev) => [...prev, newHistoryEntry]);
      }

      if (clonedBoard.winningTeam) setCheckMateOpen(true);
      return clonedBoard;
    });

    const promotionRow = playedPiece.team === "WHITE" ? 7 : 0;
    if (
      playedPiece.isPawn &&
      destination.y === promotionRow &&
      !botIsActivate
    ) {
      setPromotionOpen(true);
      setPromotionPawn(playedPiece.cloneAt(destination));
    }
    return playedMoveIsValid;
  }

  function isEnPassantMove(prev, next, type, team) {
    const pawnDir = team === "WHITE" ? 1 : -1;
    return (
      type === "PAWN" &&
      Math.abs(next.x - prev.x) === 1 &&
      next.y - prev.y === pawnDir &&
      !board.pieces.some((p) => p.samePosition(next))
    );
  }

  function choosePromotion(type) {
    if (!promotionPawn) return;
    setBoard((prevBoard) => {
      const clonedBoard = prevBoard.clone();
      const newPieces = clonedBoard.pieces.filter(
        (p) => !p.samePiecePosition(promotionPawn)
      );
      newPieces.push(
        new Piece(promotionPawn.position, type, promotionPawn.team, true)
      );
      clonedBoard.pieces = newPieces;
      clonedBoard.calculateAllMoves();
      return clonedBoard;
    });
    setPromotionOpen(false);
  }

  function renderTakenPieces(pieces, isMobile = false) {
    const containerClass = isMobile
      ? "flex-grow flex flex-col items-center justify-center"
      : "flex flex-col items-center h-20";
    return (
      <div className={containerClass}>
        <div className="flex flex-wrap justify-center gap-1">
          {pieces.map((p, i) => (
            <img
              key={i}
              className="w-5 h-5 sm:w-8 sm:h-8"
              src={p.image}
              alt={p.type}
            />
          ))}
        </div>
      </div>
    );
  }

  function restartGame() {
    setCheckMateOpen(false);
    setTakenPieces([]);
    setBoard(initialBoard.clone());
    setPrediction({ evaluation: 0, bestMove: "e2e4", moveToPlay: "e2e4" });
    setBotIsActivate(false);
    setBotCheckbox(false);
    setMoveHistory([]);
    setShowRecapModal(false);
    setRecapBoard(null);
    setGhostMoveDetails(null);
  }

  return (
    <>
      {/* --- MODALS --- */}
      {showBoardNameInput && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
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
              className="bg-[#9f4f32] hover:bg-[#9f4f32ae] text-white font-bold py-2 px-4 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
      {promotionOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            className={`flex justify-around items-center p-4 rounded ${
              promotionPawn?.team === "WHITE" ? "bg-black/80" : "bg-white/80"
            }`}
          >
            {["ROOK", "BISHOP", "KNIGHT", "QUEEN"].map((type) => (
              <img
                key={type}
                onClick={() => choosePromotion(type)}
                className={`h-24 w-24 rounded-full hover:cursor-pointer p-2 select-none ${
                  promotionPawn?.team === "WHITE"
                    ? "hover:bg-white/50"
                    : "hover:bg-black/50"
                }`}
                src={`${promotionPawn?.team.toLowerCase()}-${type.toLowerCase()}.png`}
                alt={type}
              />
            ))}
          </div>
        </div>
      )}
      {checkMateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-8">
            <div className="flex items-center justify-center flex-col gap-4">
              <span className="block">
                The winning team is {board.winningTeam}!
              </span>
              <div className="flex gap-4">
                <button
                  onClick={restartGame}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Play again
                </button>
                <button
                  onClick={() => {
                    setShowRecapModal(true);
                    setCheckMateOpen(false);
                    if (moveHistory.length > 0) {
                      handleRecapMoveClick(moveHistory[moveHistory.length - 1]);
                    }
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Game Recap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRecapModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-2">
          <div className="bg-gray-800 p-4 rounded-lg text-white w-full max-w-md lg:max-w-4xl flex flex-col lg:flex-row gap-4 h-[95vh] lg:h-auto">
            <div className="w-full lg:w-1/2 flex flex-col">
              <h2 className="text-[#ffdfba] text-xl mb-4 text-center">
                White's Moves Recap
              </h2>
              <div className="w-full mb-4 lg:hidden">
                {recapBoard && (
                  <Board
                    pieces={recapBoard.pieces}
                    board={recapBoard}
                    isRecapActive={true}
                    ghostMoveDetails={ghostMoveDetails}
                  />
                )}
              </div>
              <div className="flex-grow overflow-y-auto sm:max-h-[500px] max-h-[150px] font-mono bg-black/20 p-2 rounded-md">
                <ol className="list-decimal list-inside">
                  {moveHistory
                    .filter((_, index) => index % 2 === 0)
                    .map((move, index) => {
                      const turnNumber = index + 1;
                      return (
                        <li
                          key={index}
                          className="grid grid-cols-[auto_1fr] gap-x-4 items-center py-1"
                        >
                          <span className="text-gray-400">{turnNumber}.</span>
                          <div
                            onClick={() => handleRecapMoveClick(move)}
                            className="cursor-pointer p-1 rounded hover:bg-white/10"
                          >
                            <span
                              className={
                                !move.bestMove ||
                                move.playedMove === move.bestMove
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              Joué : {move.notation}
                            </span>
                            {move.bestMove === null ? (
                              <span className="block text-gray-400 text-xs">
                                Analyse en cours...
                              </span>
                            ) : (
                              move.playedMove !== move.bestMove && (
                                <span className="block text-yellow-500 text-xs">
                                  Recommandé : {move.bestMove}
                                </span>
                              )
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ol>
              </div>
              <button
                onClick={restartGame}
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded w-full"
              >
                Close & Restart
              </button>
            </div>
            <div className="w-full lg:w-1/2 hidden lg:block my-auto">
              {recapBoard && (
                <Board
                  pieces={recapBoard.pieces}
                  board={recapBoard}
                  isRecapActive={true}
                  ghostMoveDetails={ghostMoveDetails}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 lg:hidden">
          <div className="bg-gray-800 p-6 rounded-lg text-white w-full max-w-sm flex flex-col gap-4">
            {optionsView === "main" && (
              <>
                <h2 className="text-center text-xl text-[#ffdfba]">Options</h2>
                <div className="flex flex-col items-center gap-4 text-[#ffdfba]">
                  <div className="flex items-center justify-between w-full">
                    <label htmlFor="botCheckbox">Activer le Bot</label>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        setBotIsActivate(e.target.checked);
                        setBotCheckbox(e.target.checked);
                      }}
                      checked={botCheckbox}
                      id="botCheckbox"
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="text-lg w-full">
                    <span>Niveau du Bot: </span>
                    <input
                      className="w-24 align-middle"
                      type="range"
                      min={1}
                      max={3}
                      value={level}
                      onChange={(e) => setLevel(parseInt(e.target.value))}
                    />
                    <span className="ml-2 font-bold">{level}</span>
                  </div>
                </div>
                <div className="border-t border-gray-600 my-2"></div>
                <button
                  onClick={saveBoardToLocalStorage}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Sauvegarder la partie
                </button>
                <button
                  onClick={() => setOptionsView("load")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                >
                  Charger une partie
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded w-full"
                >
                  Fermer
                </button>
              </>
            )}
            {optionsView === "load" && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setOptionsView("main")}
                    className="text-gray-300 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} /> Retour
                  </button>
                  <h2 className="text-center text-xl text-[#ffdfba]">
                    Charger
                  </h2>
                  <div className="w-16"></div>
                </div>
                <ul className="max-h-64 overflow-y-auto bg-black/20 p-2 rounded">
                  {savedBoards.length > 0 ? (
                    savedBoards.map((savedBoard, index) => (
                      <li className="text-white mb-2" key={index}>
                        <div className="flex items-center justify-between">
                          <div
                            className="cursor-pointer hover:text-[#ffdfba]"
                            onClick={() =>
                              handleSavedBoardClick(savedBoard.fen)
                            }
                          >
                            {savedBoard.name}
                          </div>
                          <button
                            onClick={() => deleteBoard(index)}
                            className="w-5 h-5"
                          >
                            <FontAwesomeIcon
                              className="text-red-600"
                              icon={faMinus}
                            />
                          </button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400 text-center">
                      Aucune partie sauvegardée.
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- Layouts MOBILE et DESKTOP --- */}
      <div className="flex flex-col h-screen w-screen  text-white lg:hidden">
        <div className="bg-black/30 p-2 text-center text-sm font-mono">
          Eval: {prediction?.evaluation} | Best: {prediction?.bestMove}
        </div>
        <div className="w-full">
          <Board
            playMove={playMove}
            pieces={board.pieces}
            board={board}
            promotionOpen={promotionOpen}
            isRecapActive={false}
          />
        </div>
        <div className="flex-grow p-2 flex flex-row justify-around ">
          <div className="flex flex-col w-1/2 space-y-2 text-center">
            <span className="text-xs text-gray-400">Prises (N)</span>
            {renderTakenPieces(blackTakenPieces, true)}
            <span className="text-xs text-gray-400">Prises (B)</span>
            {renderTakenPieces(whiteTakenPieces, true)}
          </div>
          <div className="w-1/2 flex flex-col">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="text-center p-2 bg-black/20 rounded-t-md flex justify-between items-center"
            >
              <span className="text-sm">Historique</span>
              <FontAwesomeIcon
                icon={isHistoryOpen ? faChevronUp : faChevronDown}
              />
            </button>
            {isHistoryOpen && (
              <div className="bg-black/20 p-2 rounded-b-md flex-grow overflow-y-auto h-32">
                <ol className="list-decimal list-inside text-sm font-mono">
                  {moveHistory.map((move, index) =>
                    index % 2 === 0 ? (
                      <li key={index} value={index / 2 + 1} className="flex">
                        <span className="w-10 text-right pr-2">
                          {index / 2 + 1}.
                        </span>
                        <span className="w-12">{move.notation}</span>
                        <span className="w-12">
                          {moveHistory[index + 1]?.notation}
                        </span>
                      </li>
                    ) : null
                  )}
                </ol>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex justify-around items-center p-2  border-t border-black/30">
          <button
            onClick={undoMove}
            className="flex flex-col items-center text-gray-300"
          >
            <FontAwesomeIcon icon={faUndo} className="text-xl" />
            <span className="text-xs">Annuler</span>
          </button>
          <button
            onClick={forfeitGame}
            className="flex flex-col items-center text-red-400"
          >
            <FontAwesomeIcon icon={faFlag} className="text-xl" />
            <span className="text-xs">Forfait</span>
          </button>
          <button
            onClick={() => {
              setOptionsView("main");
              setShowSettingsModal(true);
            }}
            className="flex flex-col items-center text-gray-300"
          >
            <FontAwesomeIcon icon={faCog} className="text-xl" />
            <span className="text-xs">Options</span>
          </button>
        </div>
      </div>
      <div className="hidden lg:flex w-screen min-h-screen items-center justify-center gap-10 p-4 ">
        <div className="h-[800px] w-80 flex flex-col text-white bg-[#272727] rounded-lg p-4">
          <h2 className="text-center text-lg font-semibold mb-2 text-[#ffdfba]">
            Historique
          </h2>
          <div className="bg-black/20 p-2 rounded-md flex-grow max-h-[500px] overflow-y-auto mb-4">
            <ol className="text-sm font-mono space-y-1">
              {moveHistory.map((move, index) =>
                index % 2 === 0 ? (
                  <li key={index} className="grid grid-cols-3 gap-2">
                    <span className="text-gray-400 text-right">
                      {index / 2 + 1}.
                    </span>
                    <span>{move.notation}</span>
                    <span>{moveHistory[index + 1]?.notation || ""}</span>
                  </li>
                ) : null
              )}
            </ol>
          </div>
          <h2 className="text-center text-lg font-semibold mb-2 text-[#ffdfba]">
            Pièces Prises
          </h2>
          <div className="bg-black/20 p-2 rounded-md">
            {renderTakenPieces(blackTakenPieces)}
            <hr className="border-gray-600 my-2" />
            {renderTakenPieces(whiteTakenPieces)}
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 w-[800px]">
          <p className="text-white text-2xl">
            {Math.floor(board.totalTurns)} {team}
          </p>
          <Board
            playMove={playMove}
            pieces={board.pieces}
            board={board}
            promotionOpen={promotionOpen}
            isRecapActive={false}
          />
        </div>
        <div className="flex flex-col justify-between h-[800px] text-[#ffdfba] w-56 py-4">
          <div>
            <div className="flex flex-col justify-center gap-4 items-center">
              <button
                onClick={saveBoardToLocalStorage}
                className="bg-[#9f4f32] hover:bg-[#9f4f32ae] text-[#ffdfba] font-bold text-lg py-2 px-4 rounded w-full"
              >
                Save Board
              </button>
              <h2 className="text-base">Saved Boards:</h2>
              <ul className="max-h-48 overflow-y-auto w-full">
                {savedBoards.map((s, i) => (
                  <li key={i} className="text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleSavedBoardClick(s.fen)}
                      >
                        {s.name}
                      </div>
                      <button onClick={() => deleteBoard(i)}>
                        <FontAwesomeIcon
                          className="text-red-600"
                          icon={faMinus}
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center flex-col mt-4">
              <div className="flex items-center gap-4">
                <label htmlFor="botCheckboxDesktop">Activate Bot</label>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setBotIsActivate(e.target.checked);
                    setBotCheckbox(e.target.checked);
                  }}
                  checked={botCheckbox}
                  id="botCheckboxDesktop"
                />
              </div>
              <div className="text-xl">
                Level:{" "}
                <input
                  className="w-24 align-middle"
                  type="range"
                  min={1}
                  max={3}
                  value={level}
                  onChange={(e) => setLevel(parseInt(e.target.value))}
                />{" "}
                {level}
              </div>
              <div>Eval: {prediction?.evaluation}</div>
              <div>Best Move: {prediction?.bestMove}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={undoMove}
              className="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold text-sm py-2 px-2 rounded flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faUndo} /> Annuler
            </button>
            <button
              onClick={forfeitGame}
              className="w-full bg-red-600 hover:bg-red-800 text-white font-bold text-sm py-2 px-2 rounded flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faFlag} /> Forfait
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
