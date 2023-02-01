import mongoose from 'mongoose';
import { Response, Request } from 'express';
import logger from '../logger';

export const getAllDocumentAndSendResponse = async (
  req: Request,
  res: Response,
  model: mongoose.Model<mongoose.Document>,
  filter: any = {},
  populateFields = [],
  searchIn = []
) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = parseInt(req.query.skip as string, 10) || (page - 1) * limit;
    const sort = (req.query.sort as string) || '-createdAt';
    const q = (req.query.q as string) || '';
    let modelKeys = Object.keys(model.schema.obj);
    modelKeys.unshift('_id');

    let mongoQuery: any = req.query.mongoQuery || null;

    //in list filter
    let inListQuery: any = {};
    if (req.query.inList) {
      let inListKeys = Object.keys(req.query.inList);
      let inListValues = Object.values(req.query.inList);
      inListKeys.forEach((key, index) => {
        //@ts-ignore
        inListQuery[key] = { $in: inListValues[index]?.split(',') };
      });
    }

    //not in list filter
    let notInListQuery: any = {};
    if (req.query.notInList) {
      let notInListKeys = Object.keys(req.query.notInList);
      let notInListValues = Object.values(req.query.notInList);
      notInListKeys.forEach((key, index) => {
        //@ts-ignore
        notInListQuery[key] = { $nin: notInListValues[index]?.split(',') };
      });
    }

    // in List array of object $elementMatch Filter
    let notInListArrayOfObjectQuery: any = {};
    if (req.query.notInListArrOfObj) {
      let k = Object.keys(req?.query?.notInListArrOfObj);
      let v = Object.values(req?.query?.notInListArrOfObj);

      k.forEach((key, index) => {
        let name = key.split('.')[1];
        let field = key.split('.')[0];
        //@ts-ignore
        notInListArrayOfObjectQuery[field] = {
          $elemMatch: {
            [name]: {
              //@ts-ignore
              $nin: v[index]?.split(','),
            },
          },
        };
      });
    }

    // not in List array of object $elementMatch Filter
    let inListArrayOfObjectQuery: any = {};
    if (req.query.inListArrOfObj) {
      let k = Object.keys(req?.query?.inListArrOfObj);
      let v = Object.values(req?.query?.inListArrOfObj);

      k.forEach((key, index) => {
        let name = key.split('.')[1];
        let field = key.split('.')[0];
        //@ts-ignore
        inListArrayOfObjectQuery[field] = {
          $elemMatch: {
            [name]: {
              //@ts-ignore
              $in: v[index]?.split(','),
            },
          },
        };
      });
    }

    filter = { ...req.query, ...filter };

    let fields = (req.query.fields as any) || '';
    //convert fields to array
    fields = fields.split(',');
    //remove empty fields
    fields = fields.filter((field: any) => field);
    //remove duplicates
    fields = new Set(fields).values();

    //for search in fields
    let searchQuery: any = [];
    if (q) {
      searchIn.forEach((field) => {
        searchQuery.push({ [field]: { $regex: q, $options: 'i' } });
      });
    }

    if (searchQuery.length > 0) {
      let key = '$or';
      let val = searchQuery;
      filter[key] = val;
    }

    const query = model
      .find({
        ...filter,
        ...(inListQuery && { ...inListQuery }),
        ...(notInListQuery && { ...notInListQuery }),
        ...(mongoQuery && JSON.parse(mongoQuery)),
        ...(notInListArrayOfObjectQuery && {
          ...notInListArrayOfObjectQuery,
        }),
        ...(inListArrayOfObjectQuery && { ...inListArrayOfObjectQuery }),
      })
      .skip(skip)
      .limit(limit)
      .sort(sort);

    //for populate fields
    if (populateFields.length > 0) {
      populateFields.forEach((field) => {
        query.populate(field);
      });
    }

    //for selecting fields
    if (fields) {
      fields.map((field: any) => query.select(field));
    }

    const data = await query;
    const total = await model.countDocuments({
      ...filter,
      ...(inListQuery && { ...inListQuery }),
      ...(notInListQuery && { ...notInListQuery }),
      ...(mongoQuery && JSON.parse(mongoQuery)),
      ...(notInListArrayOfObjectQuery && {
        ...notInListArrayOfObjectQuery,
      }),
      ...(inListArrayOfObjectQuery && { ...inListArrayOfObjectQuery }),
    });
    const pages = Math.ceil(total / limit);
    const pageInfo = {
      currentPage: page,
      perPage: limit,
      pageCount: pages,
      skipCount: skip,
      itemCount: total,
      hasNextPage: page < pages,
      hasPreviousPage: page > 1,
    };

    res.status(200).json({
      status: 'success',
      data,
      pageInfo,
    });
  } catch (error: any) {
    logger.error(error.message);
    res.status(500).send({
      error: error.message,
    });
  }
};

export default getAllDocumentAndSendResponse;
