import mongoose from 'mongoose';
import { Response, Request } from 'express';
import logger from '../logger';

/**
 *
 * @param req express request
 * @param res express response
 * @param model mongoose model
 * @param filter query filter object
 * @param populateFields fields to populate
 * @param searchIn fields to search in for q query
 *
 * @returns Object in response like
 * ```json
 * {
 * "status": "success",
 * "data": Array of documents,
 * "pageInfo": {
 *    currentPage: // current page number,
      perPage: // per page document count,
      pageCount: // total page count,
      skipCount: // skip count,
      itemCount: // total document count,
      hasNextPage: // true if has next page,
      hasPreviousPage: // true if has previous page,
    }
 * }
 * ```
 * 
 * @throws error if mongoose error, in this case it will send response with status 500, and error message
 * @example
 * ```ts
 * import { getAllDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/", async (req, res) => {
 * await getAllDocumentAndSendResponse(req, res, User);
 * });
 * ```
 * @example
 * if you want to populate fields in response
 * ```ts
 * import { getAllDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/", async (req, res) => {
 * await getAllDocumentAndSendResponse(req, res, User, [], ['posts']);
 * });
 * ```
 *
 * @example
 * if you want to search in specific fields
 * ```ts
 * import { getAllDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/", async (req, res) => {
 * await getAllDocumentAndSendResponse(req, res, User, [], [], ['name', 'email']);
 * });
 * ```
 * @example
 * your custom query filter object, you can also modifiy the filter object based on your needs or user role etc
 * ```ts
 * import { getAllDocumentAndSendResponse } from '@mdazad/common-utils';
 * import express from 'express';
 * import { User } from '../models/user';
 *
 * const router = express.Router();
 *
 * router.get("/", async (req, res) => {
 *
 * const filter = {
 *  active: true,
 *  role: 'admin'
 * };
 *
 * // in this case it will return all documents where active is true and role is admin, also it will use query object if passed in request
 * await getAllDocumentAndSendResponse(req, res, User, filter);
 * });
 *
 * ```
 *
 *
 * ## Query
 * pass query object, it will return documents where the field value is equal to the query value,
 * you can pass multiple query objects
 *
 * make sure when you passing query object, use same field name as in your schema
 *
 * ```ts
 * GET /api/users?key=value
 *
 * // multiple query objects
 * GET /api/users?key=value&key2=value2
 *
 * ```
 *
 * pass inList query object, it will return documents where the field value is in the list
 * ```ts
 * GET /api/users?inList[email]=xyz@gmail.com,abc@gmail.com
 * ```
 *
 * pass notInList query object, it will return documents where the field value is not in the list
 * ```ts
 * GET /api/users?notInList[email]=xyz@gmail,com,abc@gmail,com
 * ```
 *
 * pass q query to search in all fields
 * ```ts
 * GET /api/users?q=xyz
 * ```
 *
 * query with pagination, it will return 10 documents from page 1
 * ```ts
 * GET /api/users?page=1&limit=10
 * ```
 *
 * query with sort DESC, it will sort the documents by createdAt field in descending order
 * ```ts
 * GET /api/users?sort=-createdAt
 * ```
 *
 * query with sort ASC, it will sort the documents by createdAt field in ascending order
 * ```ts
 * GET /api/users?sort=createdAt
 * ```
 *
 * query with fields, it will return only the selected fields
 * ```ts
 * GET /api/users?fields=name,email
 * ```
 *
 * pass mongo compatible query object, when your query is not supported by the above query objects
 * ```ts
 * GET /api/users?mongoQuery={"active":{"$exists":true,"$ne":true}}
 * ```
 */

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
    //@ts-ignore
    fields = [...new Set(fields)];

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
