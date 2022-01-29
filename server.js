const express = require("express");
const { default: getData } = require("./api/getData");
const { default: image } = require("./api/image");
const { default: upload } = require("./api/upload");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/api/", (req, res) => res.status(200).send({ ok: true }));
app.get("/api/getData", getData);
app.post("/api/upload", upload);
app.get("/api/image", image);
app.use(express.static("build"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
