const express = require("express");

const routes = require("./src/routes/route");
const handleError = require("./src/middleware/error");

const app = express();


app.use(express.json());

app.use("", routes);

app.use(handleError);

//wildcard
app.use("*", (req, res) => {
  res.status(404).json({
    Error: "This route does not exists",
    msg: "Wildcard hit",
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("app is running");
});
