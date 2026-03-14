const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const SecurityLog = require("../models/SecurityLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getSessionData, generateTokens } = require("../utils/security.utils");

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12); // Strong salt
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user" // Default role
    });

    await SecurityLog.create({
      userId: user._id,
      action: 'ADMIN_ACTION',
      details: `New user registered: ${email}`,
      ipAddress: req.ip
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[Login] Attempt for email: ${email}`);
  const session = getSessionData(req);

  try {
    const user = await User.findOne({ email });
    console.log(`[Login] User found: ${!!user}${user ? ` (role: ${user.role}, locked: ${user.lockUntil}, attempts: ${user.loginAttempts})` : ''}`);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.log(`[Login] Account locked until ${user.lockUntil}`);
      return res.status(403).json({ message: "Account locked. Try again later." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[Login] Password match: ${isMatch}`);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      await SecurityLog.create({
        action: 'LOGIN_FAILURE',
        severity: 'MEDIUM',
        details: `Failed login attempt for ${email}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // 2FA Check
    if (user.isTwoFactorEnabled) {
      const otpToken = jwt.sign(
        { userId: user._id, role: 'partial_auth' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otpSecret = generatedOtp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      // In production, send OTP via Email/SMS. Here we just return it for testing.
      console.log(`Generated OTP for ${user.email}: ${generatedOtp}`);
      return res.status(202).json({ requires2FA: true, tempToken: otpToken, testOtp: generatedOtp });
    }

    // Limit concurrent sessions (max 2)
    const activeSessions = await RefreshToken.countDocuments({ userId: user._id, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
    if (activeSessions >= 2) {
      // Revoke oldest session or just block? Requirement says "Limit concurrent sessions (max 2 per user)"
      // Let's revoke the oldest to allow the new login
      const oldest = await RefreshToken.findOne({ userId: user._id }).sort({ createdAt: 1 });
      if (oldest) await oldest.deleteOne();
    }

    const { accessToken, refreshToken } = generateTokens(user, session);

    // Store refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      sessionHash: session.hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await SecurityLog.create({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });

  try {
    const refreshTokenDoc = await RefreshToken.findOne({ token });
    if (!refreshTokenDoc || !refreshTokenDoc.isActive) {
      if (refreshTokenDoc) {
        // Token Reuse Detection!
        await SecurityLog.create({
          userId: refreshTokenDoc.userId,
          action: 'TOKEN_REPLAY_ATTACK',
          severity: 'CRITICAL',
          details: 'Refresh token reuse detected. Revoking all tokens for user.',
          ipAddress: req.ip
        });
        await RefreshToken.deleteMany({ userId: refreshTokenDoc.userId });
      }
      return res.status(401).json({ message: "Invalid session" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_secure');
    const user = await User.findById(decoded.userId);
    const session = getSessionData(req);

    // Session Binding Check
    if (decoded.sessionHash !== session.hash) {
      await SecurityLog.create({
        userId: user._id,
        action: 'TOKEN_REPLAY_ATTACK',
        severity: 'HIGH',
        details: 'Refresh token session mismatch (IP/UA changed)',
        ipAddress: req.ip
      });
      return res.status(401).json({ message: "Invalid session" });
    }

    // Token Rotation
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, session);

    refreshTokenDoc.revokedAt = Date.now();
    refreshTokenDoc.replacedByToken = newRefreshToken;
    await refreshTokenDoc.save();

    await RefreshToken.create({
      userId: user._id,
      token: newRefreshToken,
      sessionHash: session.hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await SecurityLog.create({
      userId: user._id,
      action: 'TOKEN_REFRESH',
      ipAddress: req.ip
    });

    res.cookie('refreshToken', newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.json({ accessToken });

  } catch (err) {
    res.status(401).json({ message: "Invalid session" });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const refreshTokenDoc = await RefreshToken.findOne({ token });
    if (refreshTokenDoc) {
      refreshTokenDoc.revokedAt = Date.now();
      await refreshTokenDoc.save();
    }
  }

  await SecurityLog.create({
    userId: req.user?.userId,
    action: 'SIGN_OUT',
    ipAddress: req.ip
  });

  res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully" });
};

exports.verify2FA = async (req, res) => {
  const { tempToken, otp } = req.body;
  const session = getSessionData(req);

  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.role !== 'partial_auth') {
      return res.status(401).json({ message: "Invalid session" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: "Invalid session" });

    // In a real system, you'd verify against a stored OTP. 
    // For this prototype, we'll assume any 6-digit OTP works or check user.otpSecret if exists.
    if (user.otpSecret && (user.otpSecret !== otp || user.otpExpires < Date.now())) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const { accessToken, refreshToken } = generateTokens(user, session);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      sessionHash: session.hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await SecurityLog.create({
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      details: '2FA Verification successful',
      ipAddress: req.ip
    });

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};
