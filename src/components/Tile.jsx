import React from "react";

function Tile({ number, image }) {
  if (number % 2 === 0) {
    return (
      <div className="w-[75px] h-[75px] bg-[#9f4f32] grid place-content-center">
        {image && (
          <div
            className=" chess-piece bg-no-repeat bg-center bg-cover w-[80px] h-[80px] hover:cursor-grab active:cursor-grabbing"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        )}
      </div>
    );
  } else {
    return (
      <div className="w-[75px] h-[75px] bg-[#ffdfba] grid place-content-center">
        {image && (
          <div
            className=" chess-piece bg-no-repeat bg-center bg-cover w-[80px] h-[80px]  hover:cursor-grab active:cursor-grabbing"
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        )}
      </div>
    );
  }
}

export default Tile;
