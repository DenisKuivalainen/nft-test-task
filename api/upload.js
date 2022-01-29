const { writeFile, writeFileSync } = require("fs");
const { uid } = require("uid");
const { create } = require("ipfs-http-client");
const { default: axios } = require("axios");
const { auth } = require("../apiUtils");

const generateSvg = () => {
  const cellsAmount = 13,
    cellSize = 4;

  const g = (n, arr) => {
    const result = [...arr];
    Array(n)
      .fill()
      .forEach(() => result.push(Math.floor(Math.random() * 256)).toString());
    return result;
  };
  const chunkArray = (arr, size) =>
    arr.length > size
      ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
      : [arr];

  const start = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${
    cellSize * cellsAmount
  } ${cellSize * cellsAmount}" width="${cellSize * cellsAmount}" height="${
    cellSize * cellsAmount
  }">`;
  const end = "</svg>";

  return [
    start,
    ...chunkArray(
      chunkArray(
        Date.now()
          .toString()
          .split("")
          .map((s) => g(38, [s]))
          .flat(),
        3
      ),
      cellsAmount
    ).map((r, y) =>
      r
        .map(
          (nArr, x) =>
            `<rect width="${cellSize}" height="${cellSize}" x="${
              x * cellSize
            }" y="${y * cellSize}" style="fill:rgb(${nArr[0]},${nArr[1]},${
              nArr[2]
            })" />`
        )
        .join("")
    ),
    end,
  ].join("");
};

const handler = async (req, res) => {
  const fileName = `${uid(30)}.svg`;
  const { name } = req.body;

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      Authorization: auth,
    },
  });
  const svgAdded = await client.add({
    path: `${fileName}.svg`,
    content: generateSvg(),
  });

  const jsonAdded = await client.add({
    path: `${fileName}.json`,
    content: JSON.stringify({
      name,
      image: svgAdded.cid.toString(),
    }),
  });

  res.status(200).send(jsonAdded.cid.toString());
};

module.exports.default = handler;
