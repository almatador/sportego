import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const adminperm = express.Router();
const prisma = new PrismaClient();

// روت للقراءة
adminperm.get('/readData', async (req: Request, res: Response) => {
    try {
        const data = await prisma.permission.findMany();
        res.status(200).json(data);
    } catch (error) {
        console.error("Read Data error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

// روت للإضافة
adminperm.post('/addData', async (req: Request, res: Response) => {
    const { newData } = req.body;
    
    try {
        const adddata = await prisma.permission.create({
            data: {
                name: newData // Access the name property from the newData object
            }
        });
        res.status(200).json(adddata);
    } catch (error) {
        console.error("Add Data error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

// روت للتعديل
adminperm.put('/updateData/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { updatedData } = req.body;
    if (!updatedData || typeof updatedData.name !== "string") {
        return res.status(400).send("الرجاء تقديم الحقل name كـ نص");
    }
    try {
        const data = await prisma.permission.update({
            where: { id: parseInt(id) },
            data: updatedData
        });
        res.status(200).json(data);
    } catch (error) {
        console.error("Update Data error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

// روت للحذف
adminperm.delete('/deleteData/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.permission.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).send("تم حذف البيانات بنجاح");
    } catch (error) {
        console.error("Delete Data error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});
adminperm.post('/addAdminToPermissions', async (req: Request, res: Response) => {
    const { adminId, permissionIds } = req.body;

    // تأكد من أن adminId و permissionIds متوفرين
    if (!adminId || !Array.isArray(permissionIds)) {
        return res.status(400).send("الرجاء تقديم adminId و permissionIds (كقائمة من المعرفات)");
    }

    try {
        // تحويل adminId و permissionIds إلى أع داد صحيحة
        const adminIdInt = parseInt(adminId);
        const permissionIdsInt = permissionIds.map(id => parseInt(id));

        // تحقق من صحة المعرفات
        if (isNaN(adminIdInt) || permissionIdsInt.some(isNaN)) {
            return res.status(400).send("الرجاء تقديم قيم صحيحة للمعرفات");
        }

        // إضافة الأدمين إلى صلاحيات متعددة
        const admin = await prisma.admin.update({
            where: { id: adminIdInt },
            data: {
                permissions: {
                    connect: permissionIdsInt.map(id => ({ id }))
                }
            }
        });
        res.status(200).json(admin);
    } catch (error) {
        console.error("Add Admin to Permissions error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});
adminperm.post('/removeAdminFromPermissions', async (req: Request, res: Response) => {
    const { adminId, permissionIds } = req.body;

    if (!adminId || !Array.isArray(permissionIds) || permissionIds.length === 0) {
        return res.status(400).send("الرجاء تقديم adminId وصلاحيات (كقائمة من المعرفات)");
    }

    // تحويل adminId و permissionIds إلى أعداد صحيحة
    const adminIdInt = parseInt(adminId);
    const permissionIdsInt = permissionIds.map((id: any) => parseInt(id));

    if (isNaN(adminIdInt) || permissionIdsInt.some(isNaN)) {
        return res.status(400).send("الرجاء تقديم قيم صحيحة للمعرفات");
    }

    try {
        const updatedAdmin = await prisma.admin.update({
            where: { id: adminIdInt },
            data: {
                permissions: {
                    disconnect: permissionIdsInt.map(id => ({ id }))
                }
            }
        });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error("Remove Admin from Permissions error:", error);
        res.status(500).send("حدثت مشكلة في السيرفر");
    }
});
adminperm.get('/getAdminPermissions/:adminId', async (req: Request, res: Response) => {
    const { adminId } = req.params;

    // تأكد من أن adminId موجود
    if (!adminId) {
        return res.status(400).send("الرجاء تقديم adminId");
    }

    try {
        // تحويل adminId إلى عدد صحيح
        const adminIdInt = parseInt(adminId);

        // تحقق من صحة المعرف
        if (isNaN(adminIdInt)) {
            return res.status(400).send("الرجاء تقديم قيمة صحيحة للمعرف");
        }

        // جلب الأدمين مع صلاحياته
        const admin = await prisma.admin.findUnique({
            where: { id: adminIdInt },
            include: { permissions: true } // جلب صلاحيات الأدمين
        });

        if (!admin) {
            return res.status(404).send("الأدمين غير موجود");
        }

        res.status(200).json(admin);
    } catch (error) {
        console.error("Get Admin Permissions error:", error);
        res.status(500).send("حدثت مشكلة في السيرفر");
    }
});
adminperm.get('/getPermissionWithAdmins/:permissionId', async (req: Request, res: Response) => {
    const { permissionId } = req.params;

    // تأكد من أن permissionId موجود
    if (!permissionId) {
        return res.status(400).send("الرجاء تقديم permissionId");
    }

    try {
        // تحويل permissionId إلى عدد صحيح
        const permissionIdInt = parseInt(permissionId);

        // تحقق من صحة المعرف
        if (isNaN(permissionIdInt)) {
            return res.status(400).send("الرجاء تقديم قيمة صحيحة للمعرف");
        }

        // جلب الصلاحية مع الأدمن المرتبطين بها
        const permission = await prisma.permission.findUnique({
            where: { id: permissionIdInt },
            include: {
                admins: true // تضمين الأدمن المرتبطين بالصلاحية
            }
        });

        if (!permission) {
            return res.status(404).send("الصلاحية غير موجودة");
        }

        res.status(200).json(permission);
    } catch (error) {
        console.error("Get Permission with Admins error:", error);
        res.status(500).send("حدثت مشكلة في السيرفر");
    }
});

export default adminperm;