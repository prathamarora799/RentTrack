"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPayments = exports.deletePayment = exports.updatePayment = exports.getMyPayments = exports.addPayment = void 0;
const web_push_1 = __importDefault(require("web-push"));
const Payment_1 = __importDefault(require("../models/Payment"));
const User_1 = __importDefault(require("../models/User"));
const addPayment = async (req, res) => {
    try {
        const { amount, date, method, month, note } = req.body;
        console.log(`[PAYMENT] Add attempt - Amount: ${amount}, Month: ${month}`);
        const proofImage = req.file
            ? `/uploads/${req.file.filename}`
            : '';
        const payment = await Payment_1.default.create({
            tenant: req.user.id,
            amount, date, method, month, note, proofImage
        });
        console.log(`[PAYMENT] Added successfully - ID: ${payment._id}`);
        const tenant = await User_1.default.findById(req.user.id);
        const landlords = await User_1.default.find({ role: 'landlord', pushSubscription: { $ne: null } });
        for (const landlord of landlords) {
            if (landlord.pushSubscription) {
                try {
                    await web_push_1.default.sendNotification(landlord.pushSubscription, JSON.stringify({
                        title: 'New Payment Received 💰',
                        body: `${tenant?.name} paid $${amount} for ${month}`
                    }));
                    console.log(`[PUSH] Notification sent to landlord: ${landlord.email}`);
                }
                catch {
                    console.error('[PUSH] Failed to send to landlord');
                }
            }
        }
        res.status(201).json(payment);
    }
    catch (err) {
        console.error(`[PAYMENT] Add error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addPayment = addPayment;
const getMyPayments = async (req, res) => {
    try {
        console.log(`[PAYMENT] Fetching payments for user: ${req.user.id}`);
        const payments = await Payment_1.default.find({
            tenant: req.user.id
        }).sort({ createdAt: -1 });
        console.log(`[PAYMENT] Found ${payments.length} payments`);
        res.json(payments);
    }
    catch (err) {
        console.error(`[PAYMENT] Get error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMyPayments = getMyPayments;
const updatePayment = async (req, res) => {
    try {
        console.log(`[PAYMENT] Update attempt - ID: ${req.params.id}, Status: ${req.body.status}`);
        const payment = await Payment_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('tenant');
        if (req.body.status && payment) {
            const tenant = await User_1.default.findById(payment.tenant);
            if (tenant?.pushSubscription) {
                const msg = req.body.status === 'confirmed'
                    ? { title: 'Payment Confirmed ✅', body: `Your payment of $${payment.amount} confirmed!` }
                    : { title: 'Payment Flagged 🚩', body: `Your payment of $${payment.amount} was flagged!` };
                try {
                    await web_push_1.default.sendNotification(tenant.pushSubscription, JSON.stringify(msg));
                    console.log(`[PUSH] Notification sent to tenant: ${tenant.email}`);
                }
                catch {
                    console.error('[PUSH] Failed to send to tenant');
                }
            }
        }
        console.log(`[PAYMENT] Updated successfully - ID: ${req.params.id}`);
        res.json(payment);
    }
    catch (err) {
        console.error(`[PAYMENT] Update error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res) => {
    try {
        console.log(`[PAYMENT] Delete attempt - ID: ${req.params.id}`);
        await Payment_1.default.findByIdAndDelete(req.params.id);
        console.log(`[PAYMENT] Deleted successfully - ID: ${req.params.id}`);
        res.json({ message: 'Payment deleted' });
    }
    catch (err) {
        console.error(`[PAYMENT] Delete error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deletePayment = deletePayment;
const getAllPayments = async (req, res) => {
    try {
        console.log('[PAYMENT] Fetching all payments (landlord)');
        const payments = await Payment_1.default.find()
            .populate('tenant', 'name email')
            .sort({ createdAt: -1 });
        console.log(`[PAYMENT] Found ${payments.length} total payments`);
        res.json(payments);
    }
    catch (err) {
        console.error(`[PAYMENT] Get all error: ${err}`);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllPayments = getAllPayments;
//# sourceMappingURL=paymentController.js.map