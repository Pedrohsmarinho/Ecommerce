import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserType } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      sub: string;
      roles: string[];
      type: UserType;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      email: user.email,
      sub: user.id,
      roles: decoded.roles,
      type: user.type
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};