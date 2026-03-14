const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { globalLimiter, errorHandler } = require("./middleware/security.middleware");

const app = express();

// Connect to Database
connectDB();

// 1. Production-Grade Security Headers (HSTS, CSP, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://project-exhibition.onrender.com", "https://*.vercel.app"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin === "http://localhost:3000" || 
      origin === "https://project-exhibition.onrender.com" || 
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Device-Fingerprint"]
}));

// 3. Global Request Limiting (DDoS Protection)
app.use(globalLimiter);

// 4. Body Parsers & Cookies
app.use(express.json({ limit: '10mb' })); // Request size limits
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Logging (Simplified for server.js, detailed logs in SecurityLog)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// 6. Secure Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/content", require("./routes/content.routes"));
app.use("/api/monitoring", require("./routes/monitoring.routes"));

// Existing App Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/models", require("./routes/model.routes"));
app.use("/api/workspaces", require("./routes/workspace.routes"));
app.use("/api/folders", require("./routes/folder.routes"));
app.use("/api/shares", require("./routes/share.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/activities", require("./routes/activity.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/search", require("./routes/search.routes"));
app.use("/api/file-management", require("./routes/fileManagement.routes"));

// Advanced Platform Features
app.use("/api/ai", require("./routes/ai.routes"));
app.use("/api/feed", require("./routes/feed.routes"));
app.use("/api/clips", require("./routes/clip.routes"));
app.use("/api/distribution", require("./routes/distribution.routes"));
app.use("/api/interactions", require("./routes/interaction.routes"));

// 7. Security: Remove direct access to /uploads
// Content must be served via /api/content/stream/:id with signed URL verification

app.get("/", (req, res) => {
  res.send("Sic Mundus Secure API - Production Mode 🚀");
});

// 8. Generic Error Handler (Prevents stack trace leakage)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Secure Server running on port ${PORT}`);
});
