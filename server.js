const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve viewer.html

// ===== TOKEN STORAGE =====
let tokens = [];

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  res.send("Server working ✅");
});

// ===== GENERATE TOKEN (PER USER) =====
app.get("/generate", (req, res) => {
  const newToken = Math.random().toString(36).substring(2, 10);

  tokens.push({
    token: newToken,
    views: 0,
    maxViews: 30
  });

  res.send({
    link: `${req.protocol}://${req.get("host")}/viewer.html?token=${newToken}`
  });
});

// ===== PDF ROUTE =====
app.get("/pdf", (req, res) => {

  // 🔥 MOBILE BLOCK (NEW)
  const userAgent = req.headers['user-agent'];
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)) {
    return res.send("❌ This PDF is only available on Desktop/Laptop");
  }

  const token = req.query.token;
  const user = tokens.find(t => t.token === token);

  if (!user) {
    return res.send("Invalid link ❌");
  }

  if (user.views >= user.maxViews) {
    return res.send("View limit exceeded ❌");
  }

  user.views++;

  console.log(token, "Views:", user.views);

  res.setHeader("X-Views-Left", user.maxViews - user.views);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");

  const filePath = path.join(__dirname, "sample.pdf");
  res.sendFile(filePath);
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});