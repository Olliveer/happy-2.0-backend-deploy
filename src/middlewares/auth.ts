import { NextFunction, Request } from "express";
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';
import { AppError } from "../errors/AppError";

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export default function auth(req: Request, res: any, next: NextFunction): void {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('No token provided', 403);
  }

  const [, token] = authHeader.split(' ');

  try {
    const verified = jwt.verify(token, authConfig.jwt.secret);
    const { id } = verified as TokenPayload;

    req.user = id;

    return next();
  } catch (err) {
    throw new AppError('Invalid JWT!', 403);
  }
};

