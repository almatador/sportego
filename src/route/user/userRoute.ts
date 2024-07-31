
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';


const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

const userRoute = Router();
const prisma = new PrismaClient();

userRoute.post('/authuser', async (req, res) => {
    const { name, email, password, confPassword, cityId, countryId, status } = req.body;
    try {
        if (password !== confPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password,
                confPassword,
                cityId,
                countryId,
                status,
                secretKeyuser: {
                    create: {
                        token: generateSecretKey(), // Generate and include secret key
                    }
                }
            },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

userRoute.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 ساعة
  
      await prisma.user.update({
        where: { email },
        data: {
          
          resetTokenExpiry,
        },
      });
  
      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  
      await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: ${resetLink}`,
      });
  
      res.send('Password reset link sent to your email');
    } catch (error) {
      res.status(500).send('Error sending email');
    }
  });
  
export default userRoute;