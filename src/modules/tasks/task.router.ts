import { FastifyInstance } from 'fastify';
import {
  createTaskHandler,
  getTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from './task.controller';
import {
  createTaskSchema,
  getTaskSchema,
  getTasksSchema,
  updateTaskSchema,
  deleteTaskSchema,
} from './task.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function taskRouter(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/tasks',
    schema: createTaskSchema,
    handler: createTaskHandler,
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/tasks',
    schema: getTasksSchema,
    handler: getTasksHandler,
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/tasks/:id',
    schema: getTaskSchema,
    handler: getTaskHandler,
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/tasks/:id',
    schema: updateTaskSchema,
    handler: updateTaskHandler,
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/tasks/:id',
    schema: deleteTaskSchema,
    handler: deleteTaskHandler,
  });
}
