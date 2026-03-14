require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

const resetAdmin = async () => {
    try {
        console.log("Connecting to MongoDB:", process.env.MONGO_URI ? "URI found" : "URI MISSING!");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: "admin@vault.io" });
        console.log("Existing admin:", existingAdmin ? `Found (role: ${existingAdmin.role}, locked: ${existingAdmin.lockUntil}, attempts: ${existingAdmin.loginAttempts})` : "NOT FOUND");

        if (existingAdmin) {
            // Reset password, unlock, and ensure admin role
            const hashedPassword = await bcrypt.hash("demo", 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = "admin";
            existingAdmin.loginAttempts = 0;
            existingAdmin.lockUntil = undefined;
            await existingAdmin.save();
            console.log("Admin account reset: password=demo, role=admin, unlocked");
        } else {
            // Create fresh admin
            const hashedPassword = await bcrypt.hash("demo", 10);
            await User.create({
                name: "System Admin",
                email: "admin@vault.io",
                password: hashedPassword,
                role: "admin",
                isTwoFactorEnabled: true
            });
            console.log("Admin account created: admin@vault.io / demo");
        }

        // Also check editor and viewer
        for (const u of [
            { name: "Content Editor", email: "editor@vault.io", password: "demo", role: "editor" },
            { name: "External Viewer", email: "viewer@vault.io", password: "demo", role: "viewer" }
        ]) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                existing.password = hashedPassword;
                existing.role = u.role;
                existing.loginAttempts = 0;
                existing.lockUntil = undefined;
                await existing.save();
                console.log(`Reset: ${u.email}`);
            } else {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await User.create({ ...u, password: hashedPassword, isTwoFactorEnabled: true });
                console.log(`Created: ${u.email}`);
            }
        }

        console.log("\nAll demo accounts ready!");
        console.log("Credentials: email / password = demo");
        process.exit(0);
    } catch (error) {
        console.error("Failed:", error);
        process.exit(1);
    }
};

resetAdmin();
