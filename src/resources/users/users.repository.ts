import { Collection, MongoClient } from 'mongodb';
import { UserModel } from '~~/types/user.model';

export class UsersRepository {
  private client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  public async save(user: UserModel): Promise<void> {
    await this.getCollection().insertOne(user);
  }

  public async update(user: UserModel): Promise<void> {
    await this.getCollection().updateOne({ _id: user._id }, { $set: user });
  }

  public async findById(id: string): Promise<UserModel | null> {
    return await this.getCollection().findOne({ _id: id });
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    return await this.getCollection().findOne({ email: email });
  }

  public async removeById(id: string): Promise<void> {
    await this.getCollection().deleteOne({ _id: id });
  }

  private getCollection(): Collection<UserModel> {
    const database = this.client.db('todo');
    return database.collection<UserModel>('user');
  }
}
