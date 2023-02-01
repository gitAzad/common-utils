import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import IRequest from '../interface/IRequest';
import { authenticateToken } from './authenticateToken';

export const checkPermission = (
  permission: string,
  userRoleKey = 'role',
  userModel: mongoose.Model<mongoose.Document>,
  jwtSecret: string
) => [
  (req: IRequest, res: Response, next: NextFunction) =>
    authenticateToken(req, res, next, userModel, jwtSecret),
  (req: IRequest, res: Response, next: NextFunction) => {
    const user: any = req.user;
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not authorized to access this resource',
      });
    }
    if (!permission.includes(user?.[userRoleKey])) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not authorized to access this resource',
      });
    }

    next();
  },
];

export default checkPermission;
