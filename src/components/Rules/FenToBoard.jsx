import { ChessBoard } from "../Rules/ChessBoard.jsx";
import { Piece } from "../PieceModels/Piece.jsx";
import { Pawn } from "../PieceModels/Pawn";
import { Position } from "../PieceModels/Position.jsx";

export default function fenToBoard(fen) {
  const [boardString, totalTurns] = fen.split(" ");

  const rows = boardString.split("/");
  const pieces = [];

  const reversedRows = rows.reverse();

  for (let y = 0; y < 8; y++) {
    let x = 0;
    for (let i = 0; i < reversedRows[y].length; i++) {
      const char = reversedRows[y][i];
      if (!isNaN(char)) {
        x += parseInt(char);
      } else {
        let type = "";
        let team = "";
        switch (char.toUpperCase()) {
          case "K":
            type = "KING";
            team = char === "K" ? "WHITE" : "BLACK";
            break;
          case "Q":
            type = "QUEEN";
            team = char === "Q" ? "WHITE" : "BLACK";
            break;
          case "R":
            type = "ROOK";
            team = char === "R" ? "WHITE" : "BLACK";
            break;
          case "B":
            type = "BISHOP";
            team = char === "B" ? "WHITE" : "BLACK";
            break;
          case "N":
            type = "KNIGHT";
            team = char === "N" ? "WHITE" : "BLACK";
            break;
          case "P":
            type = "PAWN";
            team = char === "P" ? "WHITE" : "BLACK";
            break;
          default:
            break;
        }
        pieces.push(new Piece(new Position(x, y), type, team, false));
        x++;
      }
    }
  }

  const chessBoard = new ChessBoard(pieces, parseInt(totalTurns));
  chessBoard.calculateAllMoves();
  return chessBoard;
}
