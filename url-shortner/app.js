// App Imports
const express = require("express");
const path = require("path");
const dns = require("dns");

// External Module Imports
const bodyParser = require("body-parser");

// Declarations
const app = express(); // initialize our app.
const port = 4000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

// Arrays of urls
var urls = [];

// Show Form for getting data
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// Get short url and redirect to original one
app.get("/api/shorturl/:short_url", (req, res) => {
  urls.map(obj => {
    if (obj.short_url == req.params.short_url) res.redirect(obj.original_url);
  });

  res.json({
    error: "Invalid Short URL",
  });
});

app.post("/api/shorturl/new", (req, res) => {
  // Search for '://', store protocol and hostname+path
  let protocolRegExp = /^https?:\/\/(.*)/i;
  let url = req.body.url;
  let new_entry = {
    original_url: url.length > 0 && url[url.length - 1] === "/" ? url.slice(0, -1) : url,
    short_url: urls.length + 1,
  };

  console.log(new_entry);

  // Check for old entry and return that if exists.
  urls.map(obj => {
    if (url === obj.original_url) return res.json(obj);
  });

  // RegEx for protocal matching i.e. dns.lookup only search via domain without protocols
  var protocolMatch = new_entry.original_url.match(protocolRegExp);
  // return if protocol not matched (http or https)
  if (!protocolMatch) return res.json({ error: "Invalid Protocol" });

  //   // Look for valid url entry
  dns.lookup(protocolMatch[1], (err, address, family) => {
    if (err) return res.json({ error: "Invalid Hostname" }); // if given url is not valid then return error

    // store and return data
    urls.push(new_entry);
    return res.json(new_entry);
  });
});

app.listen(port, () => console.log("Server is listening on port: ", port));
