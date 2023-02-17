import { UsersRepository } from '~/resources/users/users.repository';
import { RegisterRequest } from '~~/types/register.request';
import { UserResponse } from '~~/types/user.response';
import { hashPassword } from '~/utils/password.encoder';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '~~/types/user.model';
import { LoginRequest } from '~~/types/login.request';
import { AccessTokenResponse } from '~~/types/accessToken.response';
import { BadRequestException, NotFoundException, UnauthorizedException } from '~/utils/exceptions';
import jwt from 'jsonwebtoken';
import { config } from '~/config';
import { UpdateUserRequest } from '~~/types/update.user.request';
import * as path from 'path';
import { unlinkSync } from 'fs';

export class UsersService {
  private repository: UsersRepository;

  constructor(repository: UsersRepository) {
    this.repository = repository;
  }

  public async register(request: RegisterRequest): Promise<UserResponse> {
    const newUser: UserModel = {
      _id: uuidv4(),
      name: request.name,
      email: request.email,
      password: await hashPassword(request.password),
      age: request.age,
      avatar: undefined,
    };
    await this.repository.save(newUser);
    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      age: newUser.age,
      avatar: undefined,
    };
  }

  public async login(request: LoginRequest): Promise<AccessTokenResponse> {
    const user = await this.repository.findByEmail(request.username);
    if (user == null) {
      throw new BadRequestException(`User invalid`);
    }
    const accessToken = jwt.sign({ id: user._id }, config.SECRET);
    return {
      access_token: accessToken,
      type: 'Bearer',
    };
  }

  public async getMe(user: UserModel | undefined): Promise<UserResponse> {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    return this.toResponse(user);
  }

  public async updateMe(user: UserModel | undefined, request: UpdateUserRequest): Promise<UserResponse> {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    user.age = request.age;
    await this.repository.update(user);
    return this.toResponse(user);
  }

  public async uploadImage(user: UserModel | undefined, file: Express.Multer.File | undefined) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    if (file === undefined) {
      throw new BadRequestException('File invalid');
    }

    user.avatar = file.path;
    await this.repository.update(user);
  }

  public async getImage(id: string): Promise<string> {
    const user = await this.repository.findById(id);
    if (user === null) {
      throw new BadRequestException('User invalid');
    }
    if (user.avatar === undefined) {
      throw new NotFoundException('Avatar not found');
    }
    return user.avatar;
  }

  public async deleteImage(user: UserModel | undefined) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    if (user.avatar === undefined) {
      throw new NotFoundException('Avatar not found');
    }
    unlinkSync(path.join(__dirname, user.avatar));

    user.avatar = undefined;
    await this.repository.update(user);
  }

  async deleteMe(user: UserModel | undefined) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    await this.repository.removeById(user._id);
  }

  private async toResponse(user: UserModel): Promise<UserResponse> {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      avatar: user.avatar,
    };
  }
}
