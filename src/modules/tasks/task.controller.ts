import { FastifyReply, FastifyRequest } from 'fastify';
import { PostgresError as PostgresErrorEnum } from 'pg-error-enum';
import { PostgresError } from 'postgres';

import { httpError } from '../../utils/http';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../utils/logger';
import {
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskParams,
} from './task.schema';
import {
  createTask,
  getTask,
  getTasks,
  deleteTask,
  updateTask,
} from './task.service';

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskBody }>,
  reply: FastifyReply
) {
  try {
    const result = await createTask(request.body, request.db);
    return reply.status(StatusCodes.CREATED).send(result);
  } catch (error) {
    if (error instanceof PostgresError) {
      logger.error({ error, body: request.body }, 'database error');

      if (error.code === PostgresErrorEnum.UNIQUE_VIOLATION) {
        return httpError({
          reply,
          message: 'Application already exists',
          code: StatusCodes.CONFLICT,
        });
      }

      if (error.code === PostgresErrorEnum.FOREIGN_KEY_VIOLATION) {
        return httpError({
          reply,
          message: 'Job not found',
          code: StatusCodes.NOT_FOUND,
        });
      }
    }

    logger.error(
      { error, body: request.body },
      'createApplicationHandler: unexpected error'
    );

    return httpError({
      reply,
      message: 'Failed to create application',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
