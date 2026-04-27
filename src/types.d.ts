import { Request } from 'express';
import { UserDocument } from './schemas/user.schema';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
