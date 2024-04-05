import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile";
import Referee from "./Referee.jsx";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  initialPieceState,
  GRID_SIZE,
} from "../constant.jsx";

function Board() {
  const [pieces, setPieces] = useState(initialPieceState);
  const [grabbedPiece, setGrabbedPiece] = useState(null);
  const [grabPosition, setGrabPosition] = useState({ x: -1, y: -1 });
  const chessBoardRef = useRef(null);
  const referee = new Referee();

  function grabPieces(e) {
    const chessBoard = chessBoardRef.current;
    const element = e.target;
    if (element.classList.contains("chess-piece") && chessBoard) {
      const grabX = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(
        Math.ceil((e.clientY - chessBoard.offsetTop - 600) / GRID_SIZE)
      );
      setGrabPosition({
        x: grabX,
        y: grabY,
      });

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setGrabbedPiece(element);
    }
  }

  function movePieces(e) {
    const chessBoard = chessBoardRef.current;

    if (grabbedPiece && chessBoard) {
      const minX = chessBoard.offsetLeft - 20;
      const minY = chessBoard.offsetTop - 10;
      const maxX = chessBoard.offsetLeft + chessBoard.clientWidth - 60;
      const maxY = chessBoard.offsetTop + chessBoard.clientHeight - 70;
      const x = e.clientX - 40;
      const y = e.clientY - 40;

      grabbedPiece.style.position = "absolute";

      if (x < minX) {
        grabbedPiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        grabbedPiece.style.left = `${maxX}px`;
      } else {
        grabbedPiece.style.left = `${x}px`;
      }
      if (y < minY) {
        grabbedPiece.style.top = `${minY}px`;
      } else if (y > maxY) {
        grabbedPiece.style.top = `${maxY}px`;
      } else {
        grabbedPiece.style.top = `${y}px`;
      }
    }
  }

  function dropPieces(e) {
    const chessBoard = chessBoardRef.current;
    if (grabbedPiece && chessBoard) {
      const x = Math.floor((e.clientX - chessBoard.offsetLeft) / 75);
      const y = Math.abs(
        Math.ceil((e.clientY - chessBoard.offsetTop - 600) / 75)
      );

      const currentPiece = pieces.find(
        (p) =>
          p.position.x === grabPosition.x && p.position.y === grabPosition.y
      );
      if (currentPiece) {
        const validMove = referee.isValidMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );

        const enPassantMove = referee.enPassantMove(
          grabPosition,
          { x, y },
          currentPiece.type,
          currentPiece.team,
          pieces
        );
        const pawnDirection = currentPiece.team === 1 ? 1 : -1;

        if (enPassantMove) {
          const updatedPieces = pieces.reduce((results, piece) => {
            if (
              piece.position.x === grabPosition.x &&
              piece.position.y === grabPosition.y
            ) {
              piece.enPassant = false;
              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (
              !(
                piece.position.x === x && piece.position.y === y - pawnDirection
              )
            ) {
              if (piece.type === "PAWN") {
                piece.enPassant = false;
              }
              results.push(piece);
            }
            return results;
          }, []);
          setPieces(updatedPieces);
        } else if (validMove) {
          const updatedPieces = pieces.reduce((results, piece) => {
            if (
              piece.position.x === grabPosition.x &&
              piece.position.y === grabPosition.y
            ) {
              piece.enPassant =
                Math.abs(grabPosition.y - y) === 2 && piece.type === "PAWN";
              piece.position.x = x;
              piece.position.y = y;
              results.push(piece);
            } else if (!(piece.position.x === x && piece.position.y === y)) {
              results.push(piece);
            }
            return results;
          }, []);

          setPieces(updatedPieces);
        } else {
          grabbedPiece.style.position = "relative";
          grabbedPiece.style.removeProperty("top");
          grabbedPiece.style.removeProperty("left");
        }
      }

      setGrabbedPiece(null);
    }
  }

  let board = [];

  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find(
        (p) => p.position.x === i && p.position.y === j
      );
      let image = piece ? piece.image : undefined;

      board.push(<Tile key={`${j},${i}`} image={image} number={number} />);
    }
  }

  return (
    <div
      onMouseMove={(e) => movePieces(e)}
      onMouseDown={(e) => grabPieces(e)}
      onMouseUp={(e) => dropPieces(e)}
      className=" bg-blue-800 w-[600px] h-[600px] grid grid-cols-8 grid-rows-8"
      ref={chessBoardRef}
    >
      {board}
    </div>
  );
}

export default Board;
