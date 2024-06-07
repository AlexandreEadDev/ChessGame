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
    ? `before:bg-black/40 before:rounded-full before:w-4 before:h-4 before:inset-0 before:mx-auto before:my-auto relative ${
        image
          ? "before:border-4 before:border-stone-900 before:bg-transparent before:rounded-full before:lg:w-[75px] before:lg:h-[75px] before:sm:w-[56.25px] before:sm:h-[56.25px]  before:w-[37.5px] before:h-[37.5px] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/4 before:transform before:opacity-70"
          : ""
      }`
    : "";

  return (
    <div
      className={`lg:w-[75px] lg:h-[75px] sm:w-[56.25px] sm:h-[56.25px] w-[37.5px] h-[37.5px] grid place-content-center ${tileColorClass} ${highlightClass}`}
    >
      {image && (
        <div
          className={`chess-piece bg-no-repeat bg-center bg-cover lg:w-[70px] lg:h-[70px] sm:w-[54px] sm:h-[54px] w-[34px] h-[34px] z-10 ${grabClasses}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      )}
      <div className="lg:w-[75px] lg:h-[75px] sm:w-[56.25px] sm:h-[56.25px] w-[37.5px] h-[37.5px] absolute">
        {bottomLabel && (
          <div className="absolute bottom-[0.5px] -mb-[0.5px] right-[0.5px] text-xs text-black">
            {bottomLabel}
          </div>
        )}
        {leftLabel && (
          <div className="absolute top-[0.5px] left-[0.5px] text-xs text-black">
            {leftLabel}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tile;
