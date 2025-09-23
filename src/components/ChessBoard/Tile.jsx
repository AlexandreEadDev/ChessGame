import React from "react";

function Tile({
  number,
  image,
  highlight,
  promotionOpen,
  bottomLabel,
  leftLabel,
}) {
  const grabClasses = promotionOpen
    ? ""
    : "hover:cursor-grab active:cursor-grabbing";
  const tileColorClass = number % 2 === 0 ? "bg-[#9f4f32]" : "bg-[#ffdfba]";

  const highlightClass = highlight
    ? `relative before:rounded-full before:absolute before:inset-0 before:m-auto ${
        image
          ? "before:w-[90%] before:h-[90%] before:border-4 before:border-stone-900/50"
          : "before:w-1/3 before:h-1/3 before:bg-black/40"
      }`
    : "";

  return (
    <div
      className={`w-full h-full flex items-center justify-center relative ${tileColorClass} ${highlightClass}`}
    >
      {image && (
        <div
          className={`chess-piece bg-no-repeat bg-center bg-cover w-[90%] h-[90%] z-10 ${grabClasses}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}

      {/* MODIFICATION ICI : Ajout de la classe "select-none" */}
      <div className="absolute w-full h-full top-0 left-0 text-xs font-semibold select-none">
        {bottomLabel && (
          <div
            className={`absolute bottom-0.5 right-1 ${
              number % 2 === 0 ? "text-[#ffdfba]" : "text-[#9f4f32]"
            }`}
          >
            {bottomLabel}
          </div>
        )}
        {leftLabel && (
          <div
            className={`absolute top-0.5 left-1 ${
              number % 2 === 0 ? "text-[#ffdfba]" : "text-[#9f4f32]"
            }`}
          >
            {leftLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tile;
