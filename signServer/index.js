require("dotenv").config();
const port = process.env.PORT || 3000;
const express = require("express");
const asyncHandler = require("express-async-handler");
const app = express();
const { signMessage } = require("./utils/signUtils.js");

app.use(express.json());
app.post(
  "/checkSig",
  asyncHandler(async (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "localhost:3001");
    const obj = req.body;
    let result;
    try {
      result = await signMessage(obj);
    } catch (error) {
      console.log(error);
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(400).send();
    }
  })
);
var server = app.listen(3001, function() {
  var port = server.address().port;
  console.log("Example app listening at port %s", port);
});
module.exports = server;
