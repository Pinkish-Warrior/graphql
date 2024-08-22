const express = require("express");
const app = express();
const portOptions = [3000, 4000, 5500];
const port = portOptions[Math.floor(Math.random() * portOptions.length)];

// Serve static files from the "public" directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
