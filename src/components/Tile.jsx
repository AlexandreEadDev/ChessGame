import React from "react";
import "../index.css";

function Tile({ number, image, highlight, promotionOpen }) {
  const grabClasses = promotionOpen
    ? ""
    : "hover:cursor-grab active:cursor-grabbing";
  const tileColorClass = number % 2 === 0 ? "bg-[#9f4f32]" : "bg-[#ffdfba]";
  const highlightClass = highlight
    ? "before:bg-black/40  before:rounded-full before:w-4 before:h-4 before:inset-0 before:mx-auto before:my-auto"
    : "";

  return (
    <div
      className={`w-[75px] h-[75px] grid place-content-center ${tileColorClass} ${highlightClass}`}
    >
      {image && (
        <div
          className={`chess-piece bg-no-repeat bg-center bg-cover w-[80px] h-[80px] ${grabClasses}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
    </div>
  );
}

export default Tile;
