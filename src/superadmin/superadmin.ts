import express from 'express';
import mysql from 'mysql2/promise'; // استخدام promise-based mysql2
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import connection from './../database/database';
import { generateToken } from './../faunction/passwoerds';

const superAdminRouter = express.Router();
 // Replace with your own secret key

// توليد مفتاح سري
interface super_admin {
    id: number;
    email: string;
    password: string;
    role:string;
    
}
const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};
const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};
superAdminRouter.post('/create', async (req, res) => {
  const { name, username, email, phoneNumber, password } = req.body;

  if (!name || !username || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
      // تحقق مما إذا كان اسم المستخدم موجودًا بالفعل
      const [userRows] = await connection.promise().query(
          'SELECT * FROM super_admin WHERE username = ?',
          [username]
      );

      if ((userRows as any[]).length > 0) {
          return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
      }

      // تحقق مما إذا كان البريد الإلكتروني موجودًا بالفعل
      const [emailRows] = await connection.promise().query(
          'SELECT * FROM super_admin WHERE email = ?',
          [email]
      );

      if ((emailRows as any[]).length > 0) {
          return res.status(400).json({ error: 'البريد الإلكتروني موجود بالفعل' });
      }

      const hashedPassword = await hashPassword(password);
      const query = `
      INSERT INTO super_admin (name, username, email, phoneNumber, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const role = 'superadmin';

      const [result] = await connection.promise().query(query, [name, username, email, phoneNumber, hashedPassword, role]);
      const newId = (result as mysql.OkPacket).insertId;
      const token = generateToken(newId); // استخدم الحالة كدور

      await connection.execute(
        'INSERT INTO secretkeyuser (userId, token) VALUES (?, ?)',
        [newId, token]
      );
      res.status(201).json({
          id: newId,
          name,
          username,
          email,
          phoneNumber,
          role
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدث خطأ أثناء معالجة البيانات.' });
  }
});

superAdminRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    const query = `SELECT * FROM Admim WHERE email = ?`;
  
    connection.query(query, [email], async (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
      }
  
      if (!results.length) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
      }
  
      const admin: super_admin = results[0] as super_admin;
      
      const match = await verifyPassword(password, admin.password);
      if (!match) {
        return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
      }
  
    const token = generateToken(admin.id); // استخدم الحالة كدور  
      const insertTokenQuery = `INSERT INTO secretkeysuperadmin (superAdminId, token) VALUES (?, ?)`;
      connection.query(insertTokenQuery, [admin.id, token], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'خطأ في تخزين التوكن.' });
        }
  
        res.status(200).json({admin ,token });
      });
    });
  });
  
// تسجيل الخروج

superAdminRouter.post('/logout', (req, res) => {
    const { token } = req.cookies?.authToken;
  
    if (!token) {
      return res.status(400).json({ error: 'التوكن مطلوب.' });
    }
  
    const deleteTokenQuery = `DELETE FROM secretkeysuperadmin WHERE token = ?`;
  
    connection.query(deleteTokenQuery, [token], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
      }
  
      res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
    });
});
superAdminRouter.get('/getall', (req, res) => {
    const query = `SELECT * FROM super_admin WHERE role = 'superadmin'`;
    
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching superadmin requests.' });
        }
        res.status(200).json(results);
    });
});

export default superAdminRouter;
