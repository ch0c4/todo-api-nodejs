import { Router } from "express";
import { TasksService } from "~/resources/tasks/tasks.service";
import { TasksRepository } from "~/resources/tasks/tasks.repository";
import { config } from "~/config";
import { MongoClient } from "mongodb";
import { TokensHandler } from "~/middlewares/tokens.handler";
import { Post, Route } from "tsoa";

const TasksController = Router();

const service = new TasksService(new TasksRepository(new MongoClient(config.MONGO.URI)));

TasksController.post("/", TokensHandler, async (req, res) => {
  try {
    const task = await service.addTask(req.user, req.body);
    return res.status(200).json(task);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

TasksController.get("/", TokensHandler, async (req, res) => {
  try {
    let tasks;
    if (req.query !== undefined && req.query.completed !== undefined) {
      tasks = await service.getTaskByCompleted(req.user, req.query.completed as string);
    } else if (req.query !== undefined && (req.query.skip !== undefined || req.query.limit !== undefined)) {
      tasks = await service.getPaginateTask(req.user, req.query);
    } else {
      tasks = await service.getAllTask(req.user);
    }
    return res.status(200).json(tasks);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

TasksController.get("/:id", TokensHandler, async (req, res) => {
  try {
    const task = await service.getTaskById(req.user, req.params.id);
    return res.status(200).json(task);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

TasksController.put("/:id", TokensHandler, async (req, res) => {
  try {
    const task = await service.updateTask(req.user, req.params.id, req.body);
    return res.status(200).json(task);
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});

TasksController.put("/:id", TokensHandler, async (req, res) => {
  try {
    await service.deleteTask(req.user, req.params.id);
    return res.status(204).json();
  } catch (e: any) {
    res.status(e.status).json({ error: e.error });
  }
});


export { TasksController };
