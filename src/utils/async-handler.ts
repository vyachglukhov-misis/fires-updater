import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export function asyncHandler<
  P = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  RequestQuery = ParsedQs,
  LocalsObject extends Record<string, unknown> = Record<string, unknown>,
>(
  function_: (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
  ) => Promise<void>,
): (
  request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
  response: Response<ResponseBody, LocalsObject>,
  next: NextFunction,
) => Promise<void> {
  return async function (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await function_(request, response);
    } catch (error) {
      next(error);
    }
  };
}
