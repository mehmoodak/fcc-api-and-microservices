// Node Modules
const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");

// Initializations
const app = express();
const port = 4000;

// Middlewares
app.use(express.static("public"));
app.use(fileUpload());

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "public/index.html"));
});

app.post("/api/file-analyse", (req, res) => {
  if (Object.keys(req.files).length == 0 || !req.files.upfile) {
    return res.json({
      error: true,
      msg: "Please upload file for analyse.",
    });
  }

  let file = req.files.upfile;
  res.status(200).json({
    name: file.name,
    type: file.mimetype,
    size: file.data.length,
  });
});

// Handle extra requests.
app.use((req, res, next) => {
  res.status(400).send("Error: Not Found");
  next();
});

// Listening
app.listen(port, () => console.log(`Server is listening on port ${port}`));
