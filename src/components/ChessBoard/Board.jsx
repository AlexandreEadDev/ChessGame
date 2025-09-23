import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile.jsx";
import { VERTICAL_AXIS, HORIZONTAL_AXIS } from "../PieceModels/Constant.jsx";
import { Position } from "../PieceModels/Position.jsx";

function Board({ playMove, pieces, promotionOpen, board: chessBoardState }) {
  const grabbedPieceRef = useRef(null);
  const grabPositionRef = useRef(new Position(-1, -1));
  const [activePiece, setActivePiece] = useState(null);
  const [draggedPiecePosition, setDraggedPiecePosition] = useState(null);
  const chessBoardRef = useRef(null);
  const [gridSize, setGridSize] = useState(0);

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

  // === DÉBUT DE LA NOUVELLE LOGIQUE D'ÉVÉNEMENTS ===

  const movePieces = (e) => {
    if (!grabbedPieceRef.current) return;

    // Prévient le scroll de la page sur mobile pendant le drag
    if (e.touches) {
      e.preventDefault();
    }

    const { clientX, clientY } = getEventCoordinates(e);
    grabbedPieceRef.current.style.left = `${clientX - gridSize / 2}px`;
    grabbedPieceRef.current.style.top = `${clientY - gridSize / 2}px`;
  };

  const dropPieces = (e) => {
    const chessBoard = chessBoardRef.current;

    if (grabbedPieceRef.current) {
      document.body.removeChild(grabbedPieceRef.current);
      grabbedPieceRef.current = null;
    }

    // Nettoyage des écouteurs globaux (TRÈS IMPORTANT)
    window.removeEventListener("mousemove", movePieces);
    window.removeEventListener("mouseup", dropPieces);
    window.removeEventListener("touchmove", movePieces);
    window.removeEventListener("touchend", dropPieces);

    setActivePiece(null);
    setDraggedPiecePosition(null);

    if (!chessBoard) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const boardRect = chessBoard.getBoundingClientRect();

    const x = Math.floor((clientX - boardRect.left) / gridSize);
    const y = 7 - Math.floor((clientY - boardRect.top) / gridSize);

    const currentPiece = pieces.find((p) =>
      p.samePosition(grabPositionRef.current)
    );

    if (currentPiece) {
      playMove(currentPiece.clone(), new Position(x, y));
    }
  };

  const grabPieces = (e) => {
    const chessBoard = chessBoardRef.current;
    if (
      !chessBoard ||
      promotionOpen ||
      !e.target.classList.contains("chess-piece")
    )
      return;

    const element = e.target;
    const { clientX, clientY } = getEventCoordinates(e);
    const boardRect = chessBoard.getBoundingClientRect();

    const grabX = Math.floor((clientX - boardRect.left) / gridSize);
    const grabY = 7 - Math.floor((clientY - boardRect.top) / gridSize);

    const currentGrabPosition = new Position(grabX, grabY);
    const pieceToGrab = pieces.find((p) => p.samePosition(currentGrabPosition));

    if (!pieceToGrab || pieceToGrab.team !== chessBoardState.currentTeam) {
      return;
    }

    // Ajout des écouteurs d'événements à la fenêtre entière
    window.addEventListener("mousemove", movePieces);
    window.addEventListener("mouseup", dropPieces);
    // L'option { passive: false } est cruciale pour que e.preventDefault() fonctionne sur mobile
    window.addEventListener("touchmove", movePieces, { passive: false });
    window.addEventListener("touchend", dropPieces);

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

    grabPositionRef.current = currentGrabPosition;
    setActivePiece(pieceToGrab);
    setDraggedPiecePosition(currentGrabPosition);
  };

  // === FIN DE LA NOUVELLE LOGIQUE D'ÉVÉNEMENTS ===

  const boardTiles = [];
  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, j)));
      const highlight = activePiece?.possibleMoves?.some((p) =>
        p.samePosition(new Position(i, j))
      );
      const isBeingDragged =
        draggedPiecePosition &&
        draggedPiecePosition.samePosition(new Position(i, j));
      const isBottomLabel = j === 0;
      const isLeftLabel = i === 0;
      boardTiles.push(
        <Tile
          key={`${j},${i}`}
          image={isBeingDragged ? undefined : piece?.image}
          number={number}
          highlight={highlight}
          promotionOpen={promotionOpen}
          bottomLabel={isBottomLabel ? HORIZONTAL_AXIS[i] : null}
          leftLabel={isLeftLabel ? VERTICAL_AXIS[j] : null}
        />
      );
    }
  }

  return (
    <div
      // Seuls les événements de "départ" sont maintenant ici
      onMouseDown={grabPieces}
      onTouchStart={grabPieces}
      className="w-full aspect-square grid grid-cols-8 grid-rows-8 select-none"
      ref={chessBoardRef}
    >
      {boardTiles}
    </div>
  );
}

export default Board;
