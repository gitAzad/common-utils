import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

/**
 * Find a document by id
 * @param id id of the document
 * @param model mongoose model
 * @param populateFields fields to populate
 * @returns document if found
 * @throws mongoose error
 * @example
 * ```ts
 * import { findById } from '@mdazad/common-utils';
 * import { User } from '../models/user';
 *
 * const user = await findById('id', User);
 * ```
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { findById } from '@mdazad/common-utils';
 * import { User } from '../models/user';
 *
 * const user = await findById('id', User, ['posts']);
 * ```
 */
export const findById = async (
  id: string,
  model: mongoose.Model<mongoose.Document>,
  populateFields: string[] = []
) => {
  try {
    const document = await model.findById(id);

    return document;
  } catch (error) {
    throw error;
  }
};

/**
 * Find a document by id and send response
 * @param req express request
 * @param res express response
 * @param model mongoose model
 * @param populateFields fields to populate
 * @returns document in response if found
 * @throws mongoose error
 * @example
 * ```ts
 * import { findByIdAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/:id", async (req, res) => {
 * await findByIdAndSendResponse(req, res, User);
 * });
 * ```
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { findByIdAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/:id", async (req, res) => {
 * await findByIdAndSendResponse(req, res, User, ['posts']);
 * });
 * ```
 */

export const findByIdAndSendResponse = async (
  req: Request,
  res: Response,
  model: mongoose.Model<mongoose.Document>,
  populateFields?: string[]
) => {
  try {
    const document = await findById(req.params.id, model, populateFields);
    if (!document) {
      res.status(404).send({
        status: 'error',
        message: 'Document not found',
      });
    } else {
      res.status(200).send({
        status: 'success',
        message: 'Document found',
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
