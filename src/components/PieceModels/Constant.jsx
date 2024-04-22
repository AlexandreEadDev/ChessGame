import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";

export const VERTICAL_AXIS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const HORIZONTAL_AXIS = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const GRID_SIZE = 75;

export const initialPieceState = [
  new Piece(new Position(0, 7), "ROOK", "BLACK"),
  new Piece(new Position(1, 7), "KNIGHT", "BLACK"),
  new Piece(new Position(2, 7), "BISHOP", "BLACK"),
  new Piece(new Position(3, 7), "QUEEN", "BLACK"),
  new Piece(new Position(4, 7), "KING", "BLACK"),
  new Piece(new Position(5, 7), "BISHOP", "BLACK"),
  new Piece(new Position(6, 7), "KNIGHT", "BLACK"),
  new Piece(new Position(7, 7), "ROOK", "BLACK"),
  new Pawn(new Position(0, 6), "BLACK"),
  new Pawn(new Position(1, 6), "BLACK"),
  new Pawn(new Position(2, 6), "BLACK"),
  new Pawn(new Position(3, 6), "BLACK"),
  new Pawn(new Position(4, 6), "BLACK"),
  new Pawn(new Position(5, 6), "BLACK"),
  new Pawn(new Position(6, 6), "BLACK"),
  new Pawn(new Position(7, 6), "BLACK"),
  new Piece(new Position(0, 0), "ROOK", "WHITE"),
  new Piece(new Position(1, 0), "KNIGHT", "WHITE"),
  new Piece(new Position(2, 0), "BISHOP", "WHITE"),
  new Piece(new Position(3, 0), "QUEEN", "WHITE"),
  new Piece(new Position(4, 0), "KING", "WHITE"),
  new Piece(new Position(5, 0), "BISHOP", "WHITE"),
  new Piece(new Position(6, 0), "KNIGHT", "WHITE"),
  new Piece(new Position(7, 0), "ROOK", "WHITE"),
  new Pawn(new Position(0, 1), "WHITE"),
  new Pawn(new Position(1, 1), "WHITE"),
  new Pawn(new Position(2, 1), "WHITE"),
  new Pawn(new Position(3, 1), "WHITE"),
  new Pawn(new Position(4, 1), "WHITE"),
  new Pawn(new Position(5, 1), "WHITE"),
  new Pawn(new Position(6, 1), "WHITE"),
  new Pawn(new Position(7, 1), "WHITE"),
];
