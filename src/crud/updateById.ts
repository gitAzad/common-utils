import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

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
