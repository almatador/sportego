import { Router } from 'express';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import connection from '../../database/database';
import { generateToken, verifyPassword } from '../../faunction/passwoerds';
import multer from 'multer';
import { storage } from '../../faunction/uploud';

const userRoute = Router();
const upload = multer({ storage: storage });


interface trainer {
  id: number;
  name: string;
  email: string;
  password: string;
  confPassword: string;
  cityId: number;
  gender: 'MALE' | 'FEMALE'; 
  countryId: number;
  date_of_birth?: Date;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

userRoute.post('/authtrainer', async (req, res) => {
  const { name, email, password, confPassword, cityId, countryId,  date_of_birth,  gender  } = req.body;
  try {
    if (password !== confPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // إضافة مستخدم جديد
    const [result]: any = await connection.execute(
      'INSERT INTO trainer (name, email, password, confPassword, cityId, countryId, status,date_of_birth,weight,height,gender  ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password, confPassword, cityId, countryId, date_of_birth,]
    );
    const trainerId = result.insertId;

    const token = generateToken(trainerId); // استخدم الحالة كدور
    // إضافة مفتاح سري
    await connection.execute(
      'INSERT INTO secretkeytrainer (trainerId, token) VALUES (?, ?)',
      [trainerId, token]
    );
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    }); res.status(201).json({ id: trainerId, name, email, password, confPassword, cityId, countryId, status, date_of_birth, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

userRoute.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // البحث عن المستخدم
    const [users]: any = await connection.execute(
      'SELECT * FROM trainer WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).send('User not found');
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 ساعة

    // تحديث بيانات المستخدم
    await connection.execute(
      'UPDATE trainer SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email]
    );

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // await transporter.sendMail({
    //   from: 'your-email@gmail.com',
    //   to: email,
    //   subject: 'Password Reset',
    //   text: `Click the following link to reset your password: ${resetLink}`,
    // });

    res.send('Password reset link sent to your email');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
});



// روت لتحديث صورة البروفايل
userRoute.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  const { userId } = req.body;

  // تأكد من أن الملف تم رفعه
  if (!req.file) {
    return res.status(400).json({ error: 'لم يتم رفع أي صورة' });
  }

  try {
    // تحديث مسار صورة البروفايل في قاعدة البيانات باستخدام SQL مباشر
    const [result]: any = connection.execute(
      'UPDATE trainer SET profile_image_path = ? WHERE id = ?',
      [req.file.path, parseInt(userId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'لم يتم العثور على المستخدم' });
    }

    res.status(200).json({ message: 'تم رفع وتحديث صورة البروفايل بنجاح' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث صورة البروفايل' });
  }
});

userRoute.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM trainer WHERE email = ?';

  connection.query(query, [email], async (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'خطأ في التحقق من بيانات المدير.' });
    }

    if (!results.length) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const user: trainer = results[0] as trainer;

    const match = await verifyPassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    const tokenQuery = 'SELECT * FROM secretkeytrainer WHERE userId = ?';

    connection.query(tokenQuery, [user.id], (err, tokenResults: mysql.RowDataPacket[]) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'خطأ في التحقق من التوكن.' });
      }

      if (tokenResults.length) {
        return res.status(403).json({ error: 'حسابك قيد الاستخدام من قبل شخص آخر.' });
      }

      const token = generateToken(user.id);

      const insertTokenQuery = 'INSERT INTO secretkeytrainer (userId, token) VALUES (?, ?)';

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

userRoute.post('/logout', (req, res) => {
  const token = req.cookies?.authToken;
  console.log(token)
  if (!token) {
    return res.status(400).json({ error: 'لم يتم العثور على التوكن.' });
  }

  const deleteTokenQuery = `DELETE FROM secretkeytrainer WHERE token = ?`;

  connection.query(deleteTokenQuery, [token], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'خطأ في إلغاء التوكن.' });
    }
    res.clearCookie('authToken');
    res.status(200).json({ message: 'تم تسجيل الخروج بنجاح.' });
  });
});



export default userRoute;
