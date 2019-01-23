const express = require("express");
const app = express();
const port = 4000;

// Root Path (redirecting to timestamp).
app.get("/", (req, res) => {
  return res.redirect("/api/timestamp");
});

// Timestamp Microservice.
app.get("/api/timestamp/:date_string?", (req, res) => {
  let timestamp;
  let date_string = req.params.date_string;

  // Logging Input
  console.log("Input Date String: ", date_string);

  // if there is no parameters.
  if (!date_string) {
    timestamp = new Date();
    res.json({
      unix: timestamp.getTime(),
      utc: timestamp.toUTCString(),
    });
  }

  try {
    timestamp = new Date(date_string);
    res.json({
      unix: timestamp.getTime(),
      utc: timestamp.toUTCString(),
    });
  } catch (e) {
    res.json({ error: "Invalid Date" });
  }
});

// Listening to express app.
app.listen(port, () => {
  return console.log(`Server is listening on port: ${port}`);
});
