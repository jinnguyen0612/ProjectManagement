import { Response } from "express";
import { ApiResponse } from "../core/types/response.type";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponse<T>
) => {
  return res.status(statusCode).json({
    success: payload.success,
    message: payload.message || null,
    data: payload.data || null,
    meta: payload.meta || null,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
};