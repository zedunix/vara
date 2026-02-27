import { Request, Response } from 'express';

export const getExample = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'GET request successful',
    data: { example: 'This is example data' }
  });
};

export const createExample = (req: Request, res: Response) => {
  const data = req.body;
  res.status(201).json({
    message: 'POST request successful',
    data: data
  });
};
