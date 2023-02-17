import { Router } from 'express';
import { UsersService } from '~/resources/users/users.service';
import { UsersRepository } from '~/resources/users/users.repository';
import { MongoClient } from 'mongodb';
import { config } from '~/config';
import { UserResponse } from '~~/types/user.response';
import { AccessTokenResponse } from '~~/types/accessToken.response';
import { TokensHandler } from '~/middlewares/tokens.handler';
import multer from 'multer';
import * as path from 'path';
import { UserRequest } from "~~/types/user.request";

const UsersController = Router();

const service = new UsersService(new UsersRepository(new MongoClient(config.MONGO.URI)));
const imageUpload = multer({
  dest: 'images',
});

UsersController.post('/register', async (req, res) => {
  try {
    const response: UserResponse = await service.register(req.body);
    res.status(200).json(response);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.post('/login', async (req, res) => {
  try {
    const response: AccessTokenResponse = await service.login(req.body);
    res.status(200).json(response);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.get('/me', TokensHandler, async (req, res) => {
  try {
    const user = await service.getMe(req.user);
    return res.status(200).json(user);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.put('/me', TokensHandler, async (req, res) => {
  try {
    const user = await service.updateMe(req.user, req.body);
    return res.status(200).json(user);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.post('/me/avatar', TokensHandler, imageUpload.single('image'), async (req, res) => {
  try {
    await service.uploadImage(req.user, req.file);
    return res.status(204).json();
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.post('/:id/avatar', async (req, res) => {
  try {
    const imagePath: string = await service.getImage(req.params.id);
    return res.sendFile(path.join(__dirname, imagePath));
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.delete('/me/avatar', TokensHandler, async (req, res) => {
  try {
    await service.deleteImage(req.user);
    return res.status(204).json();
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

UsersController.delete("/me", TokensHandler, async (req, res) => {
  try {
    await service.deleteMe(req.user);
    return res.status(204).json();
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
})

export { UsersController };
