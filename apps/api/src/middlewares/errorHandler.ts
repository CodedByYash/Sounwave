import { NextFunction, Request, Response } from 'express';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.status(500).send({ errors: [{ message: 'Something went wrong' }] });
  return;
};
