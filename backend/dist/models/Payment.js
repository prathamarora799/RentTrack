"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    tenant: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    method: {
        type: String,
        enum: ['bank transfer', 'cash', 'online', 'cheque'],
        default: 'bank transfer'
    },
    month: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'flagged'],
        default: 'pending'
    },
    note: { type: String, default: '' },
    proofImage: { type: String, default: '' }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=Payment.js.map