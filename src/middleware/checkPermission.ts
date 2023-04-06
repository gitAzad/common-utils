import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import IRequest from '../interface/IRequest';
import jwt from 'jsonwebtoken';

export const checkPermission = (
  permission: string[],
  jwtSecret: string,
  userRoleKey = 'role',
  userCollectionName = 'users'
) => [
  async (req: IRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    const tokenData: any = jwt.verify(token, jwtSecret);

    //find user by id without mongoose model
    let user = await mongoose.connection.db
      .collection(userCollectionName)
      .findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });

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

    req.user = user;
    req.userId = user?._id?.toString();
    next();
  },
];

export default checkPermission;
