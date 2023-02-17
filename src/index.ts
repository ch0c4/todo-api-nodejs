import express from 'express';
import cors from 'cors';
import { UnknownRoutesHandler } from '~/middlewares/unknownRoutes.handler';
import { ExceptionsHandler } from '~/middlewares/exceptions.handler';
import { config } from '~/config';
import { UsersController } from '~/resources/users/users.controller';
import { TasksController } from '~/resources/tasks/tasks.controller';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));

app.use('/users', UsersController);
app.use('/tasks', TasksController);

app.all('*', UnknownRoutesHandler);

app.use(ExceptionsHandler);

app.listen(config.API_PORT, () => console.log(`Server listening on port ${config.API_PORT}`));
