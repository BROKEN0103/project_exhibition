const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { logActivity } = require("../utils/auditLogger");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "viewer" // Default role
    });

    logActivity({
      user: user._id,
      userName: user.name,
      action: "login", // Actually signup but treat as first entry
      details: "User registered",
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(403).json({
      message: "Account locked due to multiple failed attempts. Try again later."
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Reset login attempts on success
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  // 2FA Check
  if (user.isTwoFactorEnabled) {
    // Generate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpSecret = generatedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    console.log(`[OTP] Sent to ${email}: ${generatedOtp}`); // Debug

    // Issue temp token for 2FA verification step
    const tempToken = jwt.sign(
      { userId: user._id, email: user.email, role: 'partial_auth' },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(202).json({
      message: "OTP required",
      requires2FA: true,
      tempToken: tempToken
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionExpiresAt: user.subscriptionExpiresAt
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  logActivity({
    user: user._id,
    userName: user.name,
    action: "login",
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus
    }
  });
};

exports.verify2FA = async (req, res) => {
  const { tempToken, otp } = req.body;

  if (!tempToken || !otp) {
    return res.status(400).json({ message: "Token and OTP required" });
  }

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.role !== 'partial_auth') {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Verify OTP
    if (user.otpSecret !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otpSecret = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Issue real token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logActivity({
      user: user._id,
      userName: user.name,
      action: "login_2fa",
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (err) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};
