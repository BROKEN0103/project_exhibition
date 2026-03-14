require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const admin = await User.findOne({ email: "admin@vault.io" });
        if (!admin) {
            console.log("ADMIN NOT FOUND!");
            process.exit(1);
        }

        console.log("Admin found:");
        console.log("  _id:", admin._id);
        console.log("  name:", admin.name);
        console.log("  email:", admin.email);
        console.log("  role:", admin.role);
        console.log("  isTwoFactorEnabled:", admin.isTwoFactorEnabled);
        console.log("  loginAttempts:", admin.loginAttempts);
        console.log("  lockUntil:", admin.lockUntil);
        console.log("  password hash:", admin.password);
        console.log("  password hash length:", admin.password.length);

        // Test bcrypt compare
        const match = await bcrypt.compare("demo", admin.password);
        console.log("\n  bcrypt.compare('demo', hash) =", match);

        if (!match) {
            console.log("\n  FIXING: re-hashing password...");
            const newHash = await bcrypt.hash("demo", 10);
            console.log("  New hash:", newHash);
            
            // Use updateOne to bypass any middleware
            await User.updateOne(
                { _id: admin._id },
                { $set: { password: newHash, loginAttempts: 0 }, $unset: { lockUntil: 1 } }
            );
            console.log("  Password updated via updateOne");
            
            // Verify again
            const updated = await User.findById(admin._id);
            const match2 = await bcrypt.compare("demo", updated.password);
            console.log("  Verify after update:", match2);
        }

        process.exit(0);
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
};

verify();
