import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

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
