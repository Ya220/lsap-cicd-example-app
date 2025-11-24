// app.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop!</h1>");
});

// **New API Endpoint**
app.get('/api/time', (req, res) => {
    // Returns the current time as a valid ISO 8601 string
    const currentTime = new Date().toISOString(); 
    res.json({
        time: currentTime
    });
});

module.exports = app;
