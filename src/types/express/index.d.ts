import { UserModel } from '~~/types/user.model';

export {};

declare global {
  namespace Express {
    export interface Request {
      user?: UserModel;
    }
  }
}
