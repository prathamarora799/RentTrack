"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const web_push_1 = __importDefault(require("web-push"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Save subscription
router.post('/subscribe', auth_1.protect, async (req, res) => {
    try {
        const subscription = req.body;
        await User_1.default.findByIdAndUpdate(req.user.id, { pushSubscription: subscription });
        res.status(201).json({ message: 'Subscribed successfully' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// Send notification to specific user
router.post('/send', auth_1.protect, async (req, res) => {
    try {
        const { userId, title, body } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user?.pushSubscription) {
            return res.status(404).json({ message: 'No subscription found' });
        }
        const payload = JSON.stringify({ title, body });
        await web_push_1.default.sendNotification(user.pushSubscription, payload);
        res.json({ message: 'Notification sent ✅' });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to send notification' });
    }
});
// Get public VAPID key
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map