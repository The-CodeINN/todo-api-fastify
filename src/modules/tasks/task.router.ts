import { FastifyInstance } from 'fastify';
import { createTaskHandler } from './task.controller';
import { createTaskSchema } from './task.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export async function taskRouter(server: FastifyInstance) {
  server.withTypeProvider<ZodTypeProvider>().post('/tasks', {
    schema: createTaskSchema,
    handler: createTaskHandler,
  });
}
