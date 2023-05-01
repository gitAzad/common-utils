import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

/**
 * Update a document by id
 * @param id id of the document
 * @param model mongoose model
 * @param data data to update
 * @param populateFields fields to populate
 * @returns updated document
 * @throws mongoose error
 * @example
 * ```ts
 * import { updateById } from '@mdazad/common-utils';
 * import { User } from '../models/user';
 *
 * const updatedUser = await updateById('id', User, { name: 'John Doe' });
 * ```
 *
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { updateById } from '@mdazad/common-utils';
 * import { User } from '../models/user';
 *
 * const updatedUser = await updateById('id', User, { name: 'John Doe' }, ['posts']);
 * ```
 */
export const updateById = async (
  id: string,
  model: mongoose.Model<mongoose.Document>,
  data: any,
  populateFields: string[] = []
) => {
  try {
    const updatedDocument = await model.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedDocument;
  } catch (error: any) {
    logger.error(error.message);
  }
};

/**
 * Update a document by id and send response
 * @param req express request
 * @param res express response
 * @param model mongoose model
 * @param data data to update
 * @param populateFields fields to populate
 * @returns updated document in response if found
 * @throws mongoose error
 * @example
 * ```ts
 * import { updateByIdAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.put("/:id", async (req, res) => {
 * await updateByIdAndSendResponse(req, res, User, { name: 'John Doe' });
 * });
 * ```
 *
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { updateByIdAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.put("/:id", async (req, res) => {
 * await updateByIdAndSendResponse(req, res, User, { name: 'John Doe' }, ['posts']);
 * });
 * ```
 */

export const updateByIdAndSendResponse = async (
  req: Request,
  res: Response,
  model: mongoose.Model<mongoose.Document>,
  data: any,
  populateFields: string[] = []
) => {
  try {
    const document = await updateById(
      req.params.id,
      model,
      data,
      populateFields
    );
    if (!document) {
      res.status(404).send({
        status: 'error',
        message: 'Document not found',
      });
    } else {
      res.status(200).send({
        status: 'success',
        message: 'Document updated',
        data: document,
      });
    }
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).send({
      error: error.message,
    });
  }
};
