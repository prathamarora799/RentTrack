"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Get my profile
router.get('/profile', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update my profile
router.put('/profile', auth_1.protect, async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { name: req.body.name, phone: req.body.phone, unitNumber: req.body.unitNumber }, { new: true }).select('-password');
        res.json(user);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all tenants (landlord)
router.get('/tenants', auth_1.protect, async (req, res) => {
    try {
        const tenants = await User_1.default.find({ role: 'tenant' }).select('-password');
        res.json(tenants);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update tenant (landlord sets rent + due date)
// Update tenant rent + due date (landlord)
router.put('/tenants/:id', auth_1.protect, async (req, res) => {
    try {
        const tenant = await User_1.default.findByIdAndUpdate(req.params.id, {
            rentAmount: req.body.rentAmount,
            dueDate: req.body.dueDate,
            unitNumber: req.body.unitNumber
        }, { new: true }).select('-password');
        res.json(tenant);
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// Delete tenant
router.delete('/tenants/:id', auth_1.protect, async (req, res) => {
    try {
        await User_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tenant removed' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map