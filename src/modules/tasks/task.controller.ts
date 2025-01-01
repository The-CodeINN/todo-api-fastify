import { FastifyReply, FastifyRequest } from 'fastify';
import { PostgresError as PostgresErrorEnum } from 'pg-error-enum';
import { PostgresError } from 'postgres';
import { NotFoundError } from './task.service';

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
    logger.error(
      {
        error,
        body: request.body,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'createTaskHandler: error'
    );

    if (error instanceof PostgresError) {
      if (error.code === PostgresErrorEnum.UNIQUE_VIOLATION) {
        return httpError({
          reply,
          message: 'Task already exists',
          code: StatusCodes.CONFLICT,
        });
      }
    }

    return httpError({
      reply,
      message: 'Internal server error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function getTasksHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await getTasks(request.db);
    return reply.send(result);
  } catch (error) {
    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'getTasksHandler: error'
    );
    return httpError({
      reply,
      message: 'Internal server error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function getTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const result = await getTask(request.params.id, request.db);
    return reply.send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return httpError({
        reply,
        message: error.message,
        code: StatusCodes.NOT_FOUND,
      });
    }

    logger.error(
      {
        error,
        params: request.params,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'getTaskHandler: error'
    );
    return httpError({
      reply,
      message: 'Internal server error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function updateTaskHandler(
  request: FastifyRequest<{ Params: UpdateTaskParams; Body: UpdateTaskBody }>,
  reply: FastifyReply
) {
  try {
    const result = await updateTask(
      request.params.id,
      request.body,
      request.db
    );
    return reply.send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return httpError({
        reply,
        message: error.message,
        code: StatusCodes.NOT_FOUND,
      });
    }

    logger.error(
      {
        error,
        body: request.body,
        params: request.params,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'updateTaskHandler: error'
    );

    if (error instanceof PostgresError) {
      if (error.code === PostgresErrorEnum.UNIQUE_VIOLATION) {
        return httpError({
          reply,
          message: 'Task already exists',
          code: StatusCodes.CONFLICT,
        });
      }
    }

    return httpError({
      reply,
      message: 'Internal server error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export async function deleteTaskHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    await deleteTask(request.params.id, request.db);
    return reply.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return httpError({
        reply,
        message: error.message,
        code: StatusCodes.NOT_FOUND,
      });
    }

    logger.error(
      {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'deleteTaskHandler: error'
    );
    return httpError({
      reply,
      message: 'Internal server error',
      code: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
