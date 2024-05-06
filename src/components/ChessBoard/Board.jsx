import React, { useEffect, useRef, useState } from "react";
import Tile from "./Tile.jsx";
import {
  VERTICAL_AXIS,
  HORIZONTAL_AXIS,
  GRID_SIZE_SM,
  GRID_SIZE_LG,
  GRID_SIZE_XL,
  BOARD_SIZE_SM,
  BOARD_SIZE_LG,
  BOARD_SIZE_XL,
} from "../PieceModels/Constant.jsx";
import { Position } from "../PieceModels/Position.jsx";

function Board({ playMove, pieces, promotionOpen }) {
  const [grabbedPiece, setGrabbedPiece] = useState(null);
  const [grabPosition, setGrabPosition] = useState(new Position(-1, -1));
  const chessBoardRef = useRef(null);
  let board = [];
  let GRID_SIZE = 0;
  let BOARD_SIZE = 0;
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (screenSize.width < 640) {
    GRID_SIZE = GRID_SIZE_SM;
    BOARD_SIZE = BOARD_SIZE_SM;
  } else if (screenSize.width > 640 && screenSize.width < 1024) {
    GRID_SIZE = GRID_SIZE_LG;
    BOARD_SIZE = BOARD_SIZE_LG;
  } else {
    GRID_SIZE = GRID_SIZE_XL;
    BOARD_SIZE = BOARD_SIZE_XL;
  }

  function grabPieces(e) {
    const chessBoard = chessBoardRef.current;
    const element = e.target;
    if (
      element.classList.contains("chess-piece") &&
      chessBoard &&
      promotionOpen === false
    ) {
      const grabX = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
      const grabY = Math.abs(
        Math.ceil((e.clientY - chessBoard.offsetTop - BOARD_SIZE) / GRID_SIZE)
      );
      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.zIndex = "50";

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
      const x = Math.floor((e.clientX - chessBoard.offsetLeft) / GRID_SIZE);
      const y = Math.abs(
        Math.ceil((e.clientY - chessBoard.offsetTop - BOARD_SIZE) / GRID_SIZE)
      );

      const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
      if (currentPiece) {
        var success = playMove(currentPiece.clone(), new Position(x, y));

        if (!success) {
          grabbedPiece.style.position = "relative";
          grabbedPiece.style.removeProperty("top");
          grabbedPiece.style.removeProperty("left");
        }
      }
      setGrabbedPiece(null);
    }
  }

  // Board
  for (let j = VERTICAL_AXIS.length - 1; j >= 0; j--) {
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = j + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, j)));
      let image = piece ? piece.image : undefined;

      let currentPiece =
        grabbedPiece != null
          ? pieces.find((p) => p.samePosition(grabPosition))
          : undefined;
      let highlight = currentPiece?.possibleMoves
        ? currentPiece.possibleMoves.some((p) =>
            p.samePosition(new Position(i, j))
          )
        : false;

      board.push(
        <Tile
          key={`${j},${i}`}
          image={image}
          number={number}
          highlight={highlight}
          promotionOpen={promotionOpen}
        />
      );
    }
  }

  return (
    <>
      <div
        onMouseMove={(e) => movePieces(e)}
        onMouseDown={(e) => grabPieces(e)}
        onMouseUp={(e) => dropPieces(e)}
        className=" bg-blue-800 lg:w-[600px]  lg:h-[600px] sm:w-[500px] sm:h-[500px] w-[400px] h-[400px] grid grid-cols-8 grid-rows-8"
        ref={chessBoardRef}
      >
        {board}
      </div>
    </>
  );
}

export default Board;
