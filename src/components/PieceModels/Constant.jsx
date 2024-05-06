import { ChessBoard } from "../Rules/ChessBoard";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const GRID_SIZE_XL = 75;
export const GRID_SIZE_LG = 62.5;
export const GRID_SIZE_SM = 50;
export const BOARD_SIZE_XL = 600;
export const BOARD_SIZE_LG = 500;
export const BOARD_SIZE_SM = 400;

export const initialBoard = new ChessBoard(
  [
    new Piece(new Position(0, 7), "ROOK", "BLACK", false),
    new Piece(new Position(1, 7), "KNIGHT", "BLACK", false),
    new Piece(new Position(2, 7), "BISHOP", "BLACK", false),
    new Piece(new Position(3, 7), "QUEEN", "BLACK", false),
    new Piece(new Position(4, 7), "KING", "BLACK", false),
    new Piece(new Position(5, 7), "BISHOP", "BLACK", false),
    new Piece(new Position(6, 7), "KNIGHT", "BLACK", false),
    new Piece(new Position(7, 7), "ROOK", "BLACK", false),
    new Pawn(new Position(0, 6), "BLACK", false),
    new Pawn(new Position(1, 6), "BLACK", false),
    new Pawn(new Position(2, 6), "BLACK", false),
    new Pawn(new Position(3, 6), "BLACK", false),
    new Pawn(new Position(4, 6), "BLACK", false),
    new Pawn(new Position(5, 6), "BLACK", false),
    new Pawn(new Position(6, 6), "BLACK", false),
    new Pawn(new Position(7, 6), "BLACK", false),
    new Piece(new Position(0, 0), "ROOK", "WHITE", false),
    new Piece(new Position(1, 0), "KNIGHT", "WHITE", false),
    new Piece(new Position(2, 0), "BISHOP", "WHITE", false),
    new Piece(new Position(3, 0), "QUEEN", "WHITE", false),
    new Piece(new Position(4, 0), "KING", "WHITE", false),
    new Piece(new Position(5, 0), "BISHOP", "WHITE", false),
    new Piece(new Position(6, 0), "KNIGHT", "WHITE", false),
    new Piece(new Position(7, 0), "ROOK", "WHITE", false),
    new Pawn(new Position(0, 1), "WHITE", false),
    new Pawn(new Position(1, 1), "WHITE", false),
    new Pawn(new Position(2, 1), "WHITE", false),
    new Pawn(new Position(3, 1), "WHITE", false),
    new Pawn(new Position(4, 1), "WHITE", false),
    new Pawn(new Position(5, 1), "WHITE", false),
    new Pawn(new Position(6, 1), "WHITE", false),
    new Pawn(new Position(7, 1), "WHITE", false),
  ],
  1
);

initialBoard.calculateAllMoves();
