import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const admin = express.Router();
const prisma = new PrismaClient();

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

admin.get('/GetAllAdmin', async (req: Request, res: Response) => {
    try {
        const admins = await prisma.admin.findMany();
        res.status(200).json(admins);
    } catch (error) {
        console.error("Get All Admin error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }  
});

admin.post('/createAdmin', async (req: Request, res: Response) => {
    const { email, password, name, phoneNumber, username } = req.body;
    console.log(req.body);
    
    if (!email || !password || !name || !phoneNumber || !username) {
        return res.status(400).send("الرجاء تقديم جميع الحقول المطلوبة");
    }
  
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
      
        const newAdmin = await prisma.admin.create({
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
    } catch (error) {
        console.error("Create Admin error:", error);
        res.status(500).send("حدثت مشكلة في السيرفر");
    }
});
admin.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("الرجاء تقديم البريد الإلكتروني وكلمة المرور");
    }
  
    try {
        const admin = await prisma.admin.findUnique({
            where: {
                email: email,
            },
        });

        if (admin && bcrypt.compareSync(password, admin.password)) {
            // توليد التوكن الجديد
            const newToken = generateSecretKey();
            
            // تحديث أو إنشاء التوكن في قاعدة البيانات
            const secretKeyAdmin = await prisma.secretKeyadmin.findFirst({
                where: {
                    adminId: admin.id,
                },
            });

            if (secretKeyAdmin) {
                await prisma.secretKeyadmin.update({
                    where: {
                        id: secretKeyAdmin.id,
                    },
                    data: {
                        token: newToken,
                    },
                });
            } else {
                await prisma.secretKeyadmin.create({
                    data: {
                        adminId: admin.id,
                        token: newToken,
                    },
                });
            }

            res.status(200).json({ admin, token: newToken });
        } else {
            res.status(404).send("الايميل او كلمة المرور خطأ");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});
admin.post('/logout/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).send('Invalid ID');
        }

        await prisma.secretKeyadmin.updateMany({
            where: {
                adminId: parseInt(id)
            },
            data: {
                token: "null"
            }
        });

        res.clearCookie('token'); // Adjust the cookie name if different
        res.status(200).send("تم تسجيل الخروج بنجاح");
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

export default admin;
