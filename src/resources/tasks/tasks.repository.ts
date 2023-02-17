import { Collection, MongoClient } from 'mongodb';
import { TaskModel } from '~~/types/task.model';

export class TasksRepository {
  private client: MongoClient;

  constructor(client: MongoClient) {
    this.client = client;
  }

  private getCollection(): Collection<TaskModel> {
    const database = this.client.db('todo');
    return database.collection<TaskModel>('task');
  }

  public async save(task: TaskModel): Promise<void> {
    await this.getCollection().insertOne(task);
  }

  public async fetchByUserId(userId: string): Promise<TaskModel[]> {
    const tasks = this.getCollection().find({ userId: userId });
    return tasks.toArray();
  }

  public async findByIdAndUserId(taskId: string, userId: string): Promise<TaskModel | null> {
    return this.getCollection().findOne({ _id: taskId, userId: userId });
  }

  public async findByUserAndCompleted(userId: string, completed: boolean): Promise<TaskModel[]> {
    const tasks = this.getCollection().find({ userId: userId, completed: completed });
    return tasks.toArray();
  }

  public async findPaginate(userId: string, skip: number, limit: number): Promise<TaskModel[]> {
    const tasks = this.getCollection().find({ userId: userId }).skip(skip).limit(limit);
    return tasks.toArray();
  }

  public async update(task: TaskModel): Promise<void> {
    await this.getCollection().updateOne({ _id: task._id }, { $set: task });
  }

  public async remove(taskId: string, userId: string) {
    await this.getCollection().deleteOne({ _id: taskId, userId: userId });
  }
}
