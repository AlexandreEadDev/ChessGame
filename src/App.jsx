import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./index.css";
import Board from "./components/Board.jsx";

function App() {
  return (
    <div className=" grid place-content-center h-screen bg-[#1A1A1A]">
      <Board />
    </div>
  );
}

export default App;
