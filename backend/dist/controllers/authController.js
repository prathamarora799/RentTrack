"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const web_push_1 = __importDefault(require("web-push"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        console.log(`[REGISTER] Attempt - Email: ${email}, Role: ${role}`);
        if (!name || !email || !password) {
            console.warn('[REGISTER] Failed - Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            console.warn(`[REGISTER] Failed - Invalid email: ${email}`);
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (password.length < 6) {
            console.warn(`[REGISTER] Failed - Short password for: ${email}`);
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            console.warn(`[REGISTER] Failed - Email exists: ${email}`);
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashed = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({ name, email, password: hashed, role });
        console.log(`[REGISTER] Success - New user: ${email} as ${role}`);
        // Welcome push notification bhejo agar subscription hai
        if (user.pushSubscription) {
            try {
                await web_push_1.default.sendNotification(user.pushSubscription, JSON.stringify({
                    title: 'Welcome to RentTrack! 🏠',
                    body: `Hi ${name}! Your account is ready.`
                }));
                console.log(`[PUSH] Welcome notification sent to: ${email}`);
            }
            catch {
                console.warn(`[PUSH] Welcome notification failed for: ${email}`);
            }
        }
        res.status(201).json({ message: 'Registered successfully' });
    }
    catch (err) {
        console.error(`[REGISTER] Error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[LOGIN] Attempt - Email: ${email}`);
        if (!email || !password) {
            console.warn('[LOGIN] Failed - Missing fields');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            console.warn(`[LOGIN] Failed - User not found: ${email}`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match) {
            console.warn(`[LOGIN] Failed - Wrong password: ${email}`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log(`[LOGIN] Success - User: ${email}, Role: ${user.role}`);
        res.json({ token, role: user.role, name: user.name });
    }
    catch (err) {
        console.error(`[LOGIN] Error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map