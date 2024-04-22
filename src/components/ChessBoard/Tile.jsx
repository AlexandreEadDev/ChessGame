import React from "react";

function Tile({ number, image, highlight, promotionOpen }) {
  const grabClasses = promotionOpen
    ? ""
    : "hover:cursor-grab active:cursor-grabbing";
  const tileColorClass = number % 2 === 0 ? "bg-[#9f4f32]" : "bg-[#ffdfba]";
  const highlightClass = highlight
    ? `before:bg-black/40 before:rounded-full before:w-4 before:h-4 before:inset-0 before:mx-auto before:my-auto relative ${
        image
          ? "before:border-4 before:border-stone-900 before:bg-transparent before:rounded-full before:w-[75px] before:h-[75px] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/4 before:transform before:opacity-70"
          : ""
      }`
    : "";

  return (
    <div
      className={`w-[75px] h-[75px] grid place-content-center ${tileColorClass} ${highlightClass}`}
    >
      {image && (
        <div
          className={`chess-piece bg-no-repeat bg-center bg-cover w-[70px] h-[70px] z-10 ${grabClasses}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
    </div>
  );
}

export default Tile;
