// server/models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Debug log for pre-save hook
console.log("Admin model hooks:", {
    hasSaveHooks: !!AdminSchema.pre,
    preHooksCount: AdminSchema.pre ? Object.keys(AdminSchema.pre).length : 0
});

// If there is a pre-save hook, add debug logging to it
if (AdminSchema.pre && AdminSchema.pre.save) {
    const originalPreSave = AdminSchema.pre.save;
    
    AdminSchema.pre("save", async function(next) {
        console.log("Admin pre-save hook triggered");
        console.log("Is password modified:", this.isModified("password"));
        
        if (this.isModified("password")) {
            console.log("Original password length:", this.password.length);
            console.log("Hashing password in pre-save hook");
            
            try {
                this.password = await bcrypt.hash(this.password, 10);
                console.log("Password hashed in pre-save hook");
                console.log("New password hash (first 10 chars):", this.password.substring(0, 10) + "...");
                next();
            } catch (error) {
                console.error("Error in pre-save hook:", error);
                next(error);
            }
        } else {
            next();
        }
    });
}

module.exports = mongoose.model("Admin", AdminSchema);