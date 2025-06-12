import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: error.errors[0].message,
        });

        return;
      }
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
  };
};