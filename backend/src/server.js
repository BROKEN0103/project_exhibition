const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  // Trigger restart 2
  next();
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Serve static files from uploads directory - serve WITHOUT the 'uploads' prefix in the filesystem path
// so that a file at backend/uploads/file.ext is served at /uploads/file.ext
// SECURITY: Protected by auth middleware (token required in header or query param)
app.use("/uploads", require("./middleware/auth.middleware"), express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
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


app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
