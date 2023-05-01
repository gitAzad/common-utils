import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

/**
 * Delete a document by id
 * @param id id of the document
 * @param model mongoose model
 * @returns true if deleted successfully
 * @throws mongoose error
 * @example
 * ```ts
 * import { deleteById } from '@mdazad/common-utils';
 * import { User } from '../models/user';
 *
 * const deleteUser = async (req, res) => {
 *  await deleteById(req.params.id, User);
 * }
 * ```
 */

export const deleteById = async (
  id: string,
  model: mongoose.Model<mongoose.Document>
) => {
  try {
    const document = await model.findById(id);
    if (!document) {
      return;
    }
    await document.remove();
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a document by id and send response
 * @param req express request
 * @param res express response
 * @param model mongoose model
 * @returns success message in response
 * @throws mongoose error
 * @example
 * ```ts
 * import { deleteByIdAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.delete("/:id", async (req, res) => {
 * await deleteByIdAndSendResponse(req, res, User);
 * });
 * ```
 */

export const deleteByIdAndSendResponse = async (
  req: Request,
  res: Response,
  model: mongoose.Model<mongoose.Document>
) => {
  try {
    const document = await deleteById(req.params.id, model);
    if (!document) {
      res.status(404).send({
        status: 'error',
        message: 'Document not found',
      });
    } else {
      res.status(200).send({
        status: 'success',
        message: 'Document deleted',
      });
    }
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).send({
      error: error.message,
    });
  }
};
