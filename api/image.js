const { default: axios } = require("axios");
const { auth } = require("../apiUtils");

const handler = async (req, res) => {
  // const path = filesAdded.cid.toString();
  const data = await axios({
    url: `https://ipfs.infura.io:5001/api/v0/get?arg=${req.query.path}`,
    headers: { Authorization: auth },
  })
    .then((r) => r.data)
    .then((d) => d.substr(d.indexOf("<")))
    .then((d) => d.substr(0, d.lastIndexOf(">") + 1));

  res.setHeader("content-Type", "image/svg+xml");
  res.status(200).send(data);
};

module.exports.default = handler;
