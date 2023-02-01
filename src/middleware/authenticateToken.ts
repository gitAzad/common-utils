import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import IRequest from '../interface/IRequest';
import logger from '../logger';

export const authenticateToken = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
  userModel: mongoose.Model<mongoose.Document>,
  jwtSecret: string
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    const tokenData: any = jwt.verify(token, jwtSecret);

    const user = await userModel.findById(tokenData?._id);
    if (!user) return res.sendStatus(401);
    req.user = user;
    req.userId = user?._id;
    next();
  } catch (error: any) {
    logger.error(error.message);
    return res.sendStatus(401);
  }
};
