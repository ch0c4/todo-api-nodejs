import { TasksRepository } from '~/resources/tasks/tasks.repository';
import { UserModel } from '~~/types/user.model';
import { TaskCreateRequest } from '~~/types/task.create.request';
import { BadRequestException, NotFoundException } from '~/utils/exceptions';
import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from '~~/types/task.model';
import { TaskResponse } from '~~/types/task.response';
import { TaskUpdateRequest } from '~~/types/task.update.request';

export class TasksService {
  private repository: TasksRepository;

  constructor(repository: TasksRepository) {
    this.repository = repository;
  }

  public async addTask(user: UserModel | undefined, task: TaskCreateRequest): Promise<TaskResponse> {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const newTask: TaskModel = {
      _id: uuidv4(),
      description: task.description,
      completed: false,
      userId: user._id,
    };
    await this.repository.save(newTask);
    return this.toResponse(newTask);
  }

  public async getAllTask(user: UserModel | undefined): Promise<TaskResponse[]> {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const tasks = await this.repository.fetchByUserId(user._id);
    return tasks.map((task) => this.toResponse(task));
  }

  public async getTaskById(user: UserModel | undefined, id: string): Promise<TaskResponse> {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const task = await this.repository.findByIdAndUserId(id, user._id);
    if (task == null) {
      throw new NotFoundException('Task not found');
    }
    return this.toResponse(task);
  }

  public async getTaskByCompleted(user: UserModel | undefined, completed: string) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const tasks = await this.repository.findByUserAndCompleted(user._id, completed === 'true');
    return tasks.map((task) => this.toResponse(task));
  }

  public async getPaginateTask(user: UserModel | undefined, query: any) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const skip = query.skip ?? 0;
    const limit = query.limit ?? 10;
    const tasks = await this.repository.findPaginate(user._id, skip, limit);
    return tasks.map((task) => this.toResponse(task));
  }

  public async updateTask(user: UserModel | undefined, id: string, request: TaskUpdateRequest) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    const task = await this.repository.findByIdAndUserId(id, user._id);
    if (task == null) {
      throw new BadRequestException('Task invalid');
    }
    const updatedTask: TaskModel = {
      _id: id,
      description: request.description ?? task.description,
      completed: request.completed ?? task.completed,
      userId: user._id,
    };
    await this.repository.update(updatedTask);
    return this.toResponse(updatedTask);
  }

  public async deleteTask(user: UserModel | undefined, id: string) {
    if (user === undefined) {
      throw new BadRequestException('User invalid');
    }
    await this.repository.remove(id, user._id);
  }

  private toResponse(task: TaskModel): TaskResponse {
    return {
      id: task._id,
      description: task.description,
      completed: task.completed,
    };
  }
}
