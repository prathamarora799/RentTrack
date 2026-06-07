"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Multer setup
const storage = multer_1.default.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/', auth_1.protect, upload.single('proofImage'), paymentController_1.addPayment);
router.get('/my', auth_1.protect, paymentController_1.getMyPayments);
router.get('/all', auth_1.protect, paymentController_1.getAllPayments);
router.put('/:id', auth_1.protect, paymentController_1.updatePayment);
router.delete('/:id', auth_1.protect, paymentController_1.deletePayment);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map