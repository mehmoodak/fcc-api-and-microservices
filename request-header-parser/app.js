const express = require("express");
const cors = require("cors");
const app = express(); // initialize app
const port = "4000";

// Middlewares
app.use(cors());

// get ip infos even if passing through a proxy like here
app.enable("trust proxy");

// Root
app.get("/", (req, res) => res.redirect("/api/whoami"));

// WhoAmI
app.get("/api/whoami", (req, res) => {
  console.log("Who Am I");
  res.json({
    ipaddress: req.ip,
    language: req.headers["accept-language"],
    software: req.headers["user-agent"],
  });
});

// Listening
app.listen(port, () => console.log(`App is listening on port: ${port}`));
