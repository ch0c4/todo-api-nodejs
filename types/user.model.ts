import {v4 as uuidv4} from 'uuid';

export interface UserModel {
  _id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  avatar: string | undefined;
}
