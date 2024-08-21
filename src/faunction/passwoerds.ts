// passwordUtils.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
const jwtSecret = 'your-secret-key'; // تأكد من استبدالها بمفتاح سري قوي

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number): string => {
    return jwt.sign({ userId}, jwtSecret, { expiresIn: '7d' });
};