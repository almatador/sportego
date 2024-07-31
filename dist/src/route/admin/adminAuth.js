"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const admin = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const generateSecretKey = () => {
    return crypto_1.default.randomBytes(64).toString('hex');
};
admin.get('/GetAllAdmin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.admin.findMany();
        res.status(200).json(admins);
    }
    catch (error) {
        console.error("Get All Admin error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
}));
admin.post('/createAdmin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phoneNumber, username } = req.body;
    console.log(req.body);
    if (!email || !password || !name || !phoneNumber || !username) {
        return res.status(400).send("الرجاء تقديم جميع الحقول المطلوبة");
    }
    try {
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newAdmin = yield prisma.admin.create({
            data: {
                username: username,
                name: name,
                email: email,
                password: hashedPassword,
                phoneNumber: phoneNumber,
                secretKeyadmin: {
                    create: {
                        token: generateSecretKey(), // Generate and include secret key
                    }
                }
            },
            include: {
                secretKeyadmin: true // Include secret keys in the response if needed
            }
        });
        console.log("New Admin Created:", newAdmin);
        res.status(200).json(newAdmin);
    }
    catch (error) {
        console.error("Create Admin error:", error);
        res.status(500).send("حدثت مشكلة في السيرفر");
    }
}));
admin.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send("الرجاء تقديم البريد الإلكتروني وكلمة المرور");
    }
    try {
        const admin = yield prisma.admin.findUnique({
            where: {
                email: email,
            },
        });
        if (admin && bcrypt_1.default.compareSync(password, admin.password)) {
            // توليد التوكن الجديد
            const newToken = generateSecretKey();
            // تحديث أو إنشاء التوكن في قاعدة البيانات
            const secretKeyAdmin = yield prisma.secretKeyadmin.findFirst({
                where: {
                    adminId: admin.id,
                },
            });
            if (secretKeyAdmin) {
                yield prisma.secretKeyadmin.update({
                    where: {
                        id: secretKeyAdmin.id,
                    },
                    data: {
                        token: newToken,
                    },
                });
            }
            else {
                yield prisma.secretKeyadmin.create({
                    data: {
                        adminId: admin.id,
                        token: newToken,
                    },
                });
            }
            res.status(200).json({ admin, token: newToken });
        }
        else {
            res.status(404).send("الايميل او كلمة المرور خطأ");
        }
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
}));
admin.post('/logout/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).send('Invalid ID');
        }
        yield prisma.secretKeyadmin.updateMany({
            where: {
                adminId: parseInt(id)
            },
            data: {
                token: "null"
            }
        });
        res.clearCookie('token'); // Adjust the cookie name if different
        res.status(200).send("تم تسجيل الخروج بنجاح");
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
}));
exports.default = admin;
//# sourceMappingURL=adminAuth.js.map