import type { NextFunction, Request, Response } from "express";
import z, { ZodObject, ZodError } from "zod";

export const validateBody = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: err.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          },
        });
      }
      next(err);
    }
  };
};
