import mongoose from 'mongoose';
import { Request, Response } from 'express';
import logger from '../logger';

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
