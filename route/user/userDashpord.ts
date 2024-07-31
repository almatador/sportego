
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
import crypto from 'crypto';

const generateSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

const userDashpord = Router();
const prisma = new PrismaClient();


userDashpord.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
});
  
userDashpord.post('/users', async (req, res) => {
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
  
userDashpord.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, confPassword, cityId, countryId, status } = req.body;
    try {
      if (password && password !== confPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          password,
          confPassword,
          cityId,
          countryId,
          status,
        },
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
});
userDashpord.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  });

export default userDashpord;