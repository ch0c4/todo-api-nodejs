import { NextFunction, Request, Response } from 'express';
import { UsersRepository } from '~/resources/users/users.repository';
import { config } from '~/config';
import { MongoClient } from 'mongodb';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRequest } from "~~/types/user.request";

const repository = new UsersRepository(new MongoClient(config.MONGO.URI));


export const TokensHandler = async (req: Request, res: Response, next: NextFunction) => {
  const bearerToken = req.header('Authorization');
  if (bearerToken === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  let decoded: any;
  try {
    decoded = jwt.verify(bearerToken.replace('Bearer ', ''), config.SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (decoded === undefined) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await repository.findById(decoded.id);
  if (user === null) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;

  next();
};
