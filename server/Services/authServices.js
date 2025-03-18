// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const PendingUser = require("../models/PendingUser");
// const transporter = require("../config/email");
// require("dotenv").config();

// // ✅ Register User (Only Coach & Hunter)
// const registerUser = async (userData) => {
//     const { username, email, password, role } = userData;

//     if (!username || !email || !password || !role) {
//         return { status: 400, data: { message: "All fields are required" } };
//     }

//     try {
//         if (role !== "coach" && role !== "hunter") {
//             return { status: 400, data: { message: "Only Coach and Hunter can register" } };
//         }

//         const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//         const existingPendingUser = await PendingUser.findOne({ $or: [{ username }, { email }] });

//         if (existingUser || existingPendingUser) {
//             return { status: 400, data: { message: "Username or email already taken" } };
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newPendingUser = new PendingUser({ username, email, password: hashedPassword, role });

//         await newPendingUser.save();
//         sendVerificationEmail(newPendingUser);

//         return { status: 201, data: { message: "Registration request sent. Awaiting admin approval." } };
//     } catch (error) {
//         console.error("Error during registration:", error);
//         return { status: 500, data: { message: "Internal server error." } };
//     }
// };

// // ✅ Approve User
// const approveUser = async (pendingUserId) => {
//     try {
//         const pendingUser = await PendingUser.findById(pendingUserId);
//         if (!pendingUser) {
//             return { status: 404, data: { message: "Pending user not found." } };
//         }

//         await User.create({
//             username: pendingUser.username,
//             email: pendingUser.email,
//             password: pendingUser.password,
//             role: pendingUser.role,
//             isVerified: true
//         });

//         await PendingUser.findByIdAndDelete(pendingUserId);
//         sendApprovalEmail(pendingUser, true);

//         return { status: 200, data: { message: "User approved successfully!" } };
//     } catch (error) {
//         console.error("Error approving user:", error);
//         return { status: 500, data: { message: "Internal server error." } };
//     }
// };

// // ✅ Login User
// const loginUser = async (loginData) => {
//     const { email, password } = loginData;

//     if (!email || !password) {
//         return { status: 400, data: { message: "All fields are required" } };
//     }

//     try {
//         const user = await User.findOne({ email });
//         if (!user) return { status: 404, data: { message: "User not found." } };

//         if (!user.isVerified) {
//             return { status: 403, data: { message: "Your account is not approved yet." } };
//         }

//         const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

//         const redirectUrl = user.role === "coach" ? "/coach-dashboard" : "/hunter-dashboard";

//         return { status: 200, data: { token, user, redirectUrl } };
//     } catch (error) {
//         console.error("Error during login:", error);
//         return { status: 500, data: { message: "Internal server error." } };
//     }
// };

// // ✅ Reject User
// const rejectUser = async (userId) => {
//     try {
//         const pendingUser = await PendingUser.findById(userId);
//         if (!pendingUser) return { status: 404, data: { message: "User not found" } };

//         await PendingUser.findByIdAndDelete(userId);
//         sendApprovalEmail(pendingUser, false);

//         return { status: 200, data: { message: "User rejected successfully." } };
//     } catch (error) {
//         console.error("Error rejecting user:", error);
//         return { status: 500, data: { message: "Internal server error." } };
//     }
// };

// // ✅ Fetch All Pending Users
// const getPendingUsers = async () => {
//     try {
//         const pendingUsers = await PendingUser.find();
//         return { status: 200, data: pendingUsers };
//     } catch (error) {
//         console.error("Error fetching pending users:", error);
//         return { status: 500, data: { message: "Internal server error." } };
//     }
// };

// // ✅ Send Verification Email
// const sendVerificationEmail = (user) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: process.env.ADMIN_EMAIL,
//         subject: "New User Registration Approval Needed",
//         html: `<p>A new user has registered: ${user.username}</p>
//                <p><strong>Email:</strong> ${user.email}</p>
//                <p><strong>Role:</strong> ${user.role}</p>`
//     };
//     transporter.sendMail(mailOptions);
// };

// // ✅ Send Approval Email
// const sendApprovalEmail = (user, isApproved) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: user.email,
//         subject: `Your Account Has Been ${isApproved ? "Approved" : "Rejected"}`,
//         text: isApproved
//             ? `Congratulations! Your account has been approved. You can now log in.`
//             : `Sorry, your account request has been rejected.`,
//     };
//     transporter.sendMail(mailOptions);
// };

// module.exports = { registerUser, approveUser, loginUser, rejectUser, getPendingUsers };
