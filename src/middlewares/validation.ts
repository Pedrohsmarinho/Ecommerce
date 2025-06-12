import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => {
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