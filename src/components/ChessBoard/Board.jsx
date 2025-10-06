import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile.jsx";
import { VERTICAL_AXIS, HORIZONTAL_AXIS } from "../PieceModels/Constant.jsx";
import { Position } from "../PieceModels/Position.jsx";

function Board({
  playMove,
  pieces,
  promotionOpen,
  board: chessBoardState,
  isRecapActive,
  ghostMoveDetails, // Nouvelle prop pour la pièce fantôme
}) {
  const grabbedPieceRef = useRef(null);
  const originalPieceRef = useRef(null);
  const grabPositionRef = useRef(new Position(-1, -1));
  const chessBoardRef = useRef(null);
  const [gridSize, setGridSize] = useState(0);

  const [activePiece, setActivePiece] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (chessBoardRef.current) {
        setGridSize(chessBoardRef.current.offsetWidth / 8);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function getEventCoordinates(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    return touch
      ? { clientX: touch.clientX, clientY: touch.clientY }
      : { clientX: e.clientX, clientY: e.clientY };
  }

  const movePieces = (e) => {
    if (!grabbedPieceRef.current) return;
    if (e.touches) e.preventDefault();

    const { clientX, clientY } = getEventCoordinates(e);
    grabbedPieceRef.current.style.left = `${clientX - gridSize / 2}px`;
    grabbedPieceRef.current.style.top = `${clientY - gridSize / 2}px`;
  };

  const dropPieces = (e) => {
    const chessBoard = chessBoardRef.current;

    window.removeEventListener("mousemove", movePieces);
    window.removeEventListener("mouseup", dropPieces);
    window.removeEventListener("touchmove", movePieces);
    window.removeEventListener("touchend", dropPieces);

    if (originalPieceRef.current) {
      originalPieceRef.current.style.visibility = "visible";
    }
    if (grabbedPieceRef.current) {
      document.body.removeChild(grabbedPieceRef.current);
    }

    grabbedPieceRef.current = null;
    originalPieceRef.current = null;
    setActivePiece(null);

    if (!chessBoard) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const boardRect = chessBoard.getBoundingClientRect();

    if (
      clientX < boardRect.left ||
      clientX > boardRect.right ||
      clientY < boardRect.top ||
      clientY > boardRect.bottom
    ) {
      return;
    }

    const x = Math.floor((clientX - boardRect.left) / gridSize);
    const y = 7 - Math.floor((clientY - boardRect.top) / gridSize);

    const playedPiece = pieces.find((p) =>
      p.samePosition(grabPositionRef.current)
    );

    if (playedPiece && playMove) {
      playMove(playedPiece, new Position(x, y));
    }
  };

  const grabPieces = (e) => {
    if (isRecapActive || grabbedPieceRef.current || promotionOpen) return;

    const element = e.target;
    if (!element.classList.contains("chess-piece")) return;

    const chessBoard = chessBoardRef.current;
    if (!chessBoard) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const boardRect = chessBoard.getBoundingClientRect();

    const grabX = Math.floor((clientX - boardRect.left) / gridSize);
    const grabY = 7 - Math.floor((clientY - boardRect.top) / gridSize);

    const currentGrabPosition = new Position(grabX, grabY);
    const pieceToGrab = pieces.find((p) => p.samePosition(currentGrabPosition));

    if (!pieceToGrab || pieceToGrab.team !== chessBoardState.currentTeam) {
      return;
    }

    setTimeout(() => {
      setActivePiece(pieceToGrab);
    }, 0);

    grabPositionRef.current = currentGrabPosition;

    const clone = element.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = `${clientX - gridSize / 2}px`;
    clone.style.top = `${clientY - gridSize / 2}px`;
    clone.style.width = `${gridSize}px`;
    clone.style.height = `${gridSize}px`;
    clone.style.zIndex = "100";
    clone.style.pointerEvents = "none";

    grabbedPieceRef.current = clone;
    document.body.appendChild(clone);

    element.style.visibility = "hidden";
    originalPieceRef.current = element;

    window.addEventListener("mousemove", movePieces);
    window.addEventListener("mouseup", dropPieces);
    window.addEventListener("touchmove", movePieces, { passive: false });
    window.addEventListener("touchend", dropPieces);
  };

  const boardTiles = [];
  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, j)));

      const highlight = activePiece?.possibleMoves?.some((p) =>
        p.samePosition(new Position(i, j))
      );

      const isBottomLabel = j === 0;
      const isLeftLabel = i === 0;
      boardTiles.push(
        <Tile
          key={`${j},${i}`}
          image={piece?.image}
          number={number}
          promotionOpen={promotionOpen}
          highlight={highlight}
          bottomLabel={isBottomLabel ? HORIZONTAL_AXIS[i] : null}
          leftLabel={isLeftLabel ? VERTICAL_AXIS[j] : null}
        />
      );
    }
  }

  return (
    <div
      onMouseDown={grabPieces}
      onTouchStart={grabPieces}
      className="w-full aspect-square grid grid-cols-8 grid-rows-8 select-none relative" // Ajout de "relative"
      ref={chessBoardRef}
      style={{ touchAction: "none" }}
    >
      {boardTiles}

      {/* --- AFFICHAGE DE LA PIÈCE FANTÔME --- */}
      {ghostMoveDetails && gridSize > 0 && (
        <div
          className="absolute bg-no-repeat bg-center bg-cover pointer-events-none"
          style={{
            width: `${gridSize * 0.9}px`,
            height: `${gridSize * 0.9}px`,
            top: `${
              (7 - ghostMoveDetails.position.y) * gridSize + gridSize * 0.05
            }px`,
            left: `${
              ghostMoveDetails.position.x * gridSize + gridSize * 0.05
            }px`,
            backgroundImage: `url(${ghostMoveDetails.image})`,
            opacity: 0.5, // Rendre la pièce translucide
            zIndex: 20, // S'assurer qu'elle est au-dessus des pièces normales
          }}
        ></div>
      )}
    </div>
  );
}

export default Board;
