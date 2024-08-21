import express, { Request, Response } from 'express';
import connection from './../../database/database';
import { hashPassword } from './../../faunction/passwoerds';
import { generateToken, verifyPassword } from '../../faunction/passwoerds';
import mysql from 'mysql2/promise';

const admin = express.Router();

interface admin {
    id: number;
    email: string;
    password: string;
    role:string;
    phoneNumber:string;
}
// الحصول على جميع الإداريين
admin.get('/GetAllAdmin', async (req, res) => {
    try {
        const [admins]: any = await connection.execute('SELECT * FROM super_admin');
        res.status(200).json(admins);
    } catch (error) {
        console.error("Get All Admin error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

// إنشاء مدير جديد
admin.post('/create', async (req, res) => {
    const { name, username, email, phoneNumber, password, role = 'admin' } = req.body;

    if (!name || !username || !email || !phoneNumber || !password) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const query = `
            INSERT INTO admin (name, username, email, phoneNumber, password, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result]: any = await connection.execute(query, [name, username, email, phoneNumber, hashedPassword, role]);

        const newId = result.insertId;

        const token = generateToken(newId); // استخدم الحالة كدور
        // إضافة مفتاح سري
        await connection.execute(
          'INSERT INTO secretkeyadmin (adminId, token) VALUES (?, ?)',
          [newId, token]
        );
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: true,
          maxAge: 3600000,
        }); res.status(201).json({ id: newId, name, email, password,  token });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
      }
    });
    
// تسجيل الدخول
admin.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    const query = 'SELECT * FROM admin WHERE email = ?';
  
    connection.query(query, [email], async (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
      }
  
      if (!results.length) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
      }
  
      const user: admin = results[0] as admin;
  
      const match = await verifyPassword(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
      }
  
      const tokenQuery = 'SELECT * FROM secretkeyadmin WHERE adminId = ?';
  
      connection.query(tokenQuery, [user.id], (err, tokenResults: mysql.RowDataPacket[]) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'خطأ في التحقق من التوكن.' });
        }
  
        if (tokenResults.length) {
          return res.status(403).json({ error: 'حسابك قيد الاستخدام من قبل شخص آخر.' });
        }
  
        const token = generateToken(user.id);
  
        const insertTokenQuery = 'INSERT INTO secretkeyadmin (adminId, token) VALUES (?, ?)';
  
        connection.query(insertTokenQuery, [user.id, token], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
          }
  
          res.cookie('authToken', token, { httpOnly: true, secure: true });
          res.status(200).json({ user , token });
        });
      });
    });
  });
// تسجيل الخروج
admin.post('/logout/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (isNaN(parseInt(id))) {
            return res.status(400).send('Invalid ID');
        }

        await connection.execute('UPDATE secretKeyadmin SET token = NULL WHERE adminId = ?', [parseInt(id)]);

        res.clearCookie('token');
        res.status(200).send("تم تسجيل الخروج بنجاح");
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("حدث مشكلة في السيرفر");
    }
});

export default admin;
