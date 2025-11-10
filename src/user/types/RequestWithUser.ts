import { JwtPayload } from './JwtPayload';
import { Request } from 'express';
export interface RequestWithUser extends Request {
  decodedData?: JwtPayload;
  username: string;
}
