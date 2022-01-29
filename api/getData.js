const { default: axios } = require("axios");
const { auth } = require("../apiUtils");

const handler = async (req, res) => {
  // const path = filesAdded.cid.toString();
  const data = await axios({
    url: `https://ipfs.infura.io:5001/api/v0/get?arg=${req.query.path}`,
    headers: { Authorization: auth },
  })
    .then((r) => r.data)
    .then((d) => `{${d.split("{")[1].split("}")[0]}}`);

  res.setHeader("content-Type", "application/json");
  res.status(200).send(data);
};

module.exports.default = handler;
