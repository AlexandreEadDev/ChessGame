// Board.jsx - VERSION FINALE avec indicateurs
import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile.jsx";
import { VERTICAL_AXIS, HORIZONTAL_AXIS } from "../PieceModels/Constant.jsx";
import { Position } from "../PieceModels/Position.jsx";

function Board({ playMove, pieces, promotionOpen, board: chessBoardState }) {
  const grabbedPieceRef = useRef(null);
  const originalPieceRef = useRef(null);
  const grabPositionRef = useRef(new Position(-1, -1));
  const chessBoardRef = useRef(null);
  const [gridSize, setGridSize] = useState(0);

  // --- MODIFICATION N°1 : Réintroduction de l'état pour les indicateurs ---
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

    // --- MODIFICATION N°2 : Nettoyage des indicateurs après le coup ---
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

    if (playedPiece) {
      playMove(playedPiece, new Position(x, y));
    }
  };

  const grabPieces = (e) => {
    if (grabbedPieceRef.current || promotionOpen) return;

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

      // --- MODIFICATION N°4 : Réactivation du calcul pour la surbrillance ---
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
          highlight={highlight} // On passe la variable `highlight` au composant Tile
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
      className="w-full aspect-square grid grid-cols-8 grid-rows-8 select-none"
      ref={chessBoardRef}
      style={{ touchAction: "none" }}
    >
      {boardTiles}
    </div>
  );
}

export default Board;
