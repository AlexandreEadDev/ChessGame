import React from "react";

function Tile({ number, image, highlight, promotionOpen }) {
  const grabClasses = promotionOpen
    ? ""
    : "hover:cursor-grab active:cursor-grabbing";
  const tileColorClass = number % 2 === 0 ? "bg-[#9f4f32]" : "bg-[#ffdfba]";
  const highlightClass = highlight
    ? `before:bg-black/40 before:rounded-full before:w-4 before:h-4 before:inset-0 before:mx-auto before:my-auto relative ${
        image
          ? "before:border-4 before:border-stone-900 before:bg-transparent before:rounded-full before:lg:w-[75px] before:lg:h-[75px] before:sm:w-[62.5px] before:sm:h-[62.5px]  before:w-[50px] before:h-[50px] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/4 before:transform before:opacity-70"
          : ""
      }`
    : "";

  return (
    <div
      className={`lg:w-[75px] lg:h-[75px] sm:w-[62.5px] sm:h-[62.5px] w-[50px] h-[50px] grid place-content-center ${tileColorClass} ${highlightClass}`}
    >
      {image && (
        <div
          className={`chess-piece bg-no-repeat bg-center bg-cover lg:w-[70px] lg:h-[70px] sm:w-[58px] sm:h-[58px] w-[45px] h-[45px] z-10 ${grabClasses}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
    </div>
  );
}

export default Tile;
