import { NextFunction, Response, Request } from 'express';
import { validationResult } from 'express-validator';

/**
 *
 * @param validations
 * @returns
 * @description
 * this function is used to validate the request body
 * @example
 * ```ts
 * validate([body('email').isEmail(), body('password').isLength({ min: 5 })])
 * ```
 * @example
 * example with controller
 * ```ts
 * export const login = [
 * validate([body('email'), body('password')]),
 * async (req: Request, res: Response) => {
 * // do something
 * }
 * ]
 * ```
 *
 *  @example
 * // example of error response email is not valid
 * ```json
 * {
 *  "errors": [
 *   {
 *    "value": "test",
 *    "msg": "Invalid value",
 *    "param": "email",
 *    "location": "body"
 *   },
 * ]
 * ```
 *
 */

export const validate = (validations: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    res.status(400).json({ errors: errors.array() });
  };
};

export default validate;
