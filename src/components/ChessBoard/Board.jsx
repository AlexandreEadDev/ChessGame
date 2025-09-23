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
    handleResize(); // Initial calculation
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function getEventCoordinates(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    return touch
      ? { clientX: touch.clientX, clientY: touch.clientY }
      : { clientX: e.clientX, clientY: e.clientY };
  }

  function grabPieces(e) {
    const chessBoard = chessBoardRef.current;
    if (
      !chessBoard ||
      promotionOpen ||
      !e.target.classList.contains("chess-piece")
    )
      return;

    const { clientX, clientY } = getEventCoordinates(e);
    const boardRect = chessBoard.getBoundingClientRect();

    const grabX = Math.floor((clientX - boardRect.left) / gridSize);
    const grabY = 7 - Math.floor((clientY - boardRect.top) / gridSize);

    const currentGrabPosition = new Position(grabX, grabY);
    const pieceToGrab = pieces.find((p) => p.samePosition(currentGrabPosition));

    if (!pieceToGrab || pieceToGrab.team !== chessBoardState.currentTeam) {
      return;
    }

    // Mettre à jour les états pour la surbrillance et pour masquer la pièce d'origine
    grabPositionRef.current = currentGrabPosition;
    setActivePiece(pieceToGrab);
    setDraggedPiecePosition(currentGrabPosition);

    // Créer un clone "fantôme" de la pièce
    const element = e.target;
    const clone = element.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = `${clientX - gridSize / 2}px`;
    clone.style.top = `${clientY - gridSize / 2}px`;
    clone.style.width = `${gridSize}px`;
    clone.style.height = `${gridSize}px`;
    clone.style.zIndex = "100"; // S'assurer qu'il est au-dessus de tout
    clone.style.pointerEvents = "none"; // Pour ne pas interférer avec les événements de la souris

    // Stocker le clone dans la ref et l'ajouter au corps du document
    grabbedPieceRef.current = clone;
    document.body.appendChild(clone);
  }

  function movePieces(e) {
    // Utiliser la ref
    if (!grabbedPieceRef.current) return;

    e.preventDefault();
    const { clientX, clientY } = getEventCoordinates(e);
    // Utiliser la ref
    grabbedPieceRef.current.style.left = `${clientX - gridSize / 2}px`;
    grabbedPieceRef.current.style.top = `${clientY - gridSize / 2}px`;
  }

  function dropPieces(e) {
    const chessBoard = chessBoardRef.current;

    // Supprimer le clone du DOM
    if (grabbedPieceRef.current) {
      document.body.removeChild(grabbedPieceRef.current);
      grabbedPieceRef.current = null;
    }

    // Toujours réinitialiser les états
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
  }

  const boardTiles = [];
  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, j)));

      const highlight = activePiece?.possibleMoves?.some((p) =>
        p.samePosition(new Position(i, j))
      );

      // Vérifier si la pièce sur cette case est celle qui est en train d'être déplacée
      const isBeingDragged =
        draggedPiecePosition &&
        draggedPiecePosition.samePosition(new Position(i, j));

      const isBottomLabel = j === 0;
      const isLeftLabel = i === 0;

      boardTiles.push(
        <Tile
          key={`${j},${i}`}
          // Si la pièce est déplacée, on ne passe pas d'image à la tuile
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
      onMouseMove={movePieces}
      onMouseDown={grabPieces}
      onMouseUp={dropPieces}
      onTouchStart={grabPieces}
      onTouchMove={movePieces}
      onTouchEnd={dropPieces}
      className="w-full aspect-square grid grid-cols-8 grid-rows-8"
      ref={chessBoardRef}
    >
      {boardTiles}
    </div>
  );
}

export default Board;
