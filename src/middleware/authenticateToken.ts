import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import IRequest from '../interface/IRequest';
import logger from '../logger';

/**
 * @description
 * this function is used to authenticate the token
 * @example
 * ```ts
  import { authenticateToken } from '@mdazad/common-utils';
  import express from 'express';

  const router = express.Router();
  //check is user authenticated
  router.use(authenticateToken("JWT_SECRET", 'users'));

  // all routes here are protected

  ```
 * 
 * @example
 * if you want to use it in a specific route
 * ```ts
 * import { authenticateToken } from '@mdazad/common-utils';
 * import express from 'express';
 * 
 * const router = express.Router();
 * //check is user authenticated
 * 
 * router.post("/",authenticateToken("JWT_SECRET", 'users'), async (req, res) => {
 * // do something
 * });
 * ```
 */

export const authenticateToken = (
  jwtSecret: string,
  userCollectionName = 'users'
) => [
  async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token == null) return res.sendStatus(401);

      const tokenData: any = jwt.verify(token, jwtSecret);

      //find user by id without mongoose model
      let user = await mongoose.connection.db
        .collection(userCollectionName)
        .findOne({ _id: new mongoose.Types.ObjectId(tokenData.id) });

      if (!user) return res.sendStatus(401);
      req.user = user;
      req.userId = user?._id?.toString();
      next();
    } catch (error: any) {
      logger.error(error.message);
      return res.sendStatus(401);
    }
  },
];
