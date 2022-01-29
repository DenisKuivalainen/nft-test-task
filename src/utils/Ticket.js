import axios from "axios";
import { useState, useEffect } from "react";

export default ({
  code,
  uses,
  ticketId,
  onUse = () => {
    console.log("Use!");
  },
}) => {
  const cellsAmount = 13,
    cellSize = 4;

  const [data, setData] = useState();

  useEffect(() => {
    axios({
      method: "GET",
      url: `/api/getData?path=${code}`,
    })
      .then((res) => res.data)
      .then(setData);
  }, []);

  if (!data)
    return (
      <div
        style={{
          margin: 5,
          backgroundColor: "white",
          height: cellSize * cellsAmount + 10,
          width: 550,
          border: "2px solid black",
        }}
      />
    );
  return (
    <div
      style={{
        margin: 5,
        backgroundColor: "white",
        height: cellSize * cellsAmount + 10,
        width: 550,
        border: "2px solid black",
      }}
      onClick={onUse}
    >
      <div
        style={{
          display: "inline-block",
          margin: 5,
          height: cellSize * cellsAmount,
          width: cellSize * cellsAmount,
        }}
      >
        <img src={`/api/image?path=${data.image}`} alt={data.image} />
      </div>
      <div
        style={{
          display: "inline-block",
          marginLeft: 30,
          height: cellSize * cellsAmount,
          lineHeight: `${(cellSize * cellsAmount) / 3}px`,
          fontSize: `${(cellSize * cellsAmount) / 6}px`,
          marginTop: -10,
        }}
      >
        <a style={{ fontSize: `${(cellSize * cellsAmount) / 3 - 2}px` }}>
          {data.name}
        </a>{" "}
        {ticketId}
        <br />
        <br /> Uses left:{" "}
        <a style={{ fontSize: `${(cellSize * cellsAmount) / 4 - 2}px` }}>
          {uses}
        </a>
      </div>
    </div>
  );
};
