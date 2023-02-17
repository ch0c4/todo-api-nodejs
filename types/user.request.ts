import { Request } from 'express';
import { UserModel } from '~~/types/user.model';

export interface UserRequest extends Request {
  user: UserModel;
}
