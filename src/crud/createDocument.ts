import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

/**
 * Create a document in mongodb
 * @param model mongoose model
 * @param data data to create document
 * @param populateFields fields to populate
 * @returns created document
 * @throws mongoose error
 * @returns created document
 * @example
 * ```ts
 * import { createDocument } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.post("/", async (req, res) => {
 * const user = await createDocument(User, req.body);
 * res.status(201).send({
 * status: 'success',
 * message: 'User created successfully',
 * data: user,
 * });
 * });
 * ```
 * @example
 * if you want to populate fields.
 * ```ts
 * import { createDocument } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.post("/", async (req, res) => {
 * const user = await createDocument(User, req.body, ['posts']);
 * res.status(201).send({
 * status: 'success',
 * message: 'User created successfully',
 * data: user,
 * });
 * });
 * ```
 */

export const createDocument = async (
  model: mongoose.Model<mongoose.Document>,
  data: any,
  populateFields: string[] = []
) => {
  const document = new model(data);
  try {
    await document.save();
    if (populateFields.length > 0) {
      populateFields.forEach((field) => {
        document.populate(field);
      });
    }
    return document;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a document in mongodb and send response
 * @param req express request
 * @param res express response
 * @param model mongoose model
 * @param data data to create document
 * @param populateFields fields to populate
 * @returns created document in response
 * @throws mongoose error
 * @example
 * ```ts
 * import { createDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.post("/", async (req, res) => {
 * await createDocumentAndSendResponse(req, res, User, req.body);
 * });
 * ```
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { createDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.post("/", async (req, res) => {
 * await createDocumentAndSendResponse(req, res, User, req.body, ['posts']);
 * });
 *
 */

export const createDocumentAndSendResponse = async (
  req: Request,
  res: Response,
  model: mongoose.Model<mongoose.Document>,
  data: any,
  populateFields: string[] = []
) => {
  try {
    const document = await createDocument(model, data, populateFields);
    res.status(201).send({
      status: 'success',
      message: 'Document created successfully',
      data: document,
    });
  } catch (error: any) {
    logger.error(error.message);
    //mongoose duplicate key error
    if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(500).send({
        error: `${Object.keys(error.keyValue)[0]}:${
          Object.values(error.keyValue)[0]
        } already exists!!`,
      });
    } else {
      res.status(500).send({
        error: error.message,
      });
    }
  }
};
