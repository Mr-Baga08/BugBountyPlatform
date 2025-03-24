// server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const PendingUser = require("../models/PendingUser");
const { sendVerificationEmail, sendApprovalEmail } = require("../config/email");
const connectDB = require("../config/db");
require("dotenv").config();

// ✅ Login User
const loginUser = async (req, res) => {
    console.log("loginUser called with:", req.body);
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in loginUser:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        if (!user.isVerified) {
            return res.status(403).json({ message: "Your account is not approved yet." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        // Redirect URL based on role
        const redirectUrl = user.role === "coach" ? "/coach" : 
                           user.role === "admin" ? "/admin-dashboard" : "/hunter";
        
        return res.status(200).json({ 
            token, 
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                id: user._id
            }, 
            redirectUrl 
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// ✅ Register User (Only Coach & Hunter)
const registerUser = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in registerUser:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        if (role !== "coach" && role !== "hunter") {
            return res.status(400).json({ message: "Only Coach and Hunter can register" });
        }

        // Check for duplicate username
        const existingUsername = await User.findOne({ username });
        const existingPendingUsername = await PendingUser.findOne({ username });

        if (existingUsername || existingPendingUsername) {
            return res.status(400).json({ message: "Username already taken. Please choose a different username." });
        }

        // Check if the user is already approved
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Don't expose whether password matches for security
            return res.status(400).json({ message: "Email already registered. Please login or use a different email." });
        }

        // Check if user is already pending approval
        const existingPendingUser = await PendingUser.findOne({ email });
        if (existingPendingUser) {
            return res.status(400).json({ message: "Approval pending. Please wait for admin confirmation." });
        }

        // Create a new pending user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPendingUser = new PendingUser({ username, email, password: hashedPassword, role });

        await newPendingUser.save();
        
        // Try to send notification email but don't fail if it doesn't work
        try {
            await sendVerificationEmail(newPendingUser);
        } catch (emailError) {
            console.warn("Email notification failed, but user registration succeeded:", emailError.message);
            // Continue registration process even if email fails
        }

        return res.status(201).json({ message: "Registration request sent. Awaiting admin approval." });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// ✅ Approve User
const approveUser = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in approveUser:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    try {
        const { pendingUserId } = req.body;
        if (!pendingUserId) {
            return res.status(400).json({ message: "Pending user ID is required." });
        }

        // Find pending user
        const pendingUser = await PendingUser.findById(pendingUserId);
        if (!pendingUser) {
            return res.status(404).json({ message: "Pending user not found." });
        }

        // Check if username or email already exists
        const existingUserByUsername = await User.findOne({ username: pendingUser.username });
        const existingUserByEmail = await User.findOne({ email: pendingUser.email });

        if (existingUserByUsername || existingUserByEmail) {
            return res.status(400).json({ message: "User already exists. Please choose a different username or email." });
        }

        // Insert new user
        await User.create({
            username: pendingUser.username,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            isVerified: true
        });

        // Delete from pending collection
        await PendingUser.findByIdAndDelete(pendingUserId);
        
        // Try to send approval email
        try {
            await sendApprovalEmail(pendingUser, true);
        } catch (emailError) {
            console.warn("Approval email failed to send, but user was approved:", emailError.message);
        }

        return res.status(200).json({ message: "User approved successfully!" });

    } catch (error) {
        console.error("Error approving user:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};

// ✅ Reject User
const rejectUser = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in rejectUser:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    const { userId } = req.body;
    try {
        const pendingUser = await PendingUser.findById(userId);
        if (!pendingUser) return res.status(404).json({ message: "User not found" });

        await PendingUser.findByIdAndDelete(userId);
        
        // Try to send rejection email
        try {
            await sendApprovalEmail(pendingUser, false);
        } catch (emailError) {
            console.warn("Rejection email failed to send, but user was rejected:", emailError.message);
        }

        res.status(200).json({ message: "User rejected successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error rejecting user." });
    }
};

// ✅ Fetch All Pending Users
const getPendingUsers = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in getPendingUsers:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    try {
        const pendingUsers = await PendingUser.find();
        res.status(200).json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pending users" });
    }
};

// Role-based Dashboards
const getCoachDashboard = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in getCoachDashboard:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    if (req.user.role === "coach") {
        res.json({ message: "Welcome to the Coach Dashboard!" });
    } else {
        res.status(403).json({ message: "Access denied" });
    }
};

const getHunterDashboard = async (req, res) => {
    // Ensure DB connection first
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database connection error in getHunterDashboard:", dbError);
        return res.status(500).json({ message: "Database connection error. Please try again later." });
    }

    if (req.user.role === "hunter") {
        res.json({ message: "Welcome to the Hunter Dashboard!" });
    } else {
        res.status(403).json({ message: "Access denied" });
    }
};

// // Email notification functions wrapped with proper error handling
// const sendVerificationEmail = async (user) => {
//     if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
//         throw new Error("Email configuration missing");
//     }

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: process.env.ADMIN_EMAIL,
//         subject: "New User Registration Approval Needed",
//         html: `<p>A new user has registered: ${user.username}</p>
//                <p><strong>Email:</strong> ${user.email}</p>
//                <p><strong>Role:</strong> ${user.role}</p>`
//     };
    
//     return transporter.sendMail(mailOptions);
// };

// const sendApprovalEmail = async (user, isApproved) => {
//     if (!process.env.EMAIL_USER) {
//         throw new Error("Email configuration missing");
//     }

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: user.email,
//         subject: `Your Account Has Been ${isApproved ? "Approved" : "Rejected"}`,
//         text: isApproved
//             ? `Congratulations! Your account has been approved. You can now log in.`
//             : `Sorry, your account request has been rejected.`,
//     };
    
//     return transporter.sendMail(mailOptions);
// };

module.exports = { 
    
    registerUser, approveUser, loginUser, getCoachDashboard, getHunterDashboard, rejectUser, getPendingUsers 
  };
