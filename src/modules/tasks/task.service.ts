import { and, eq } from 'drizzle-orm';
import {
  tasks,
  selectTasksSchema,
  insertTasksSchema,
  patchTasksSchema,
} from '../../db/schema';
import { DB } from '../../db';
import { databaseQueryTimeHistogram } from '../../utils/metrics';
import { logger } from '../../utils/logger';
import { input } from 'zod';

const inputSchema = {
  create: insertTasksSchema,
  update: patchTasksSchema,
};

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function createTask(
  input: input<typeof inputSchema.create>,
  db: DB
) {
  const metricsLabels = {
    operation: 'create_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db.insert(tasks).values(input).returning();

    end(metricsLabels);
    return result[0];
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error('Error creating task', error);
    throw error;
  }
}

export async function getTasks(db: DB) {
  const metricsLabels = {
    operation: 'get_tasks',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db.query.tasks.findMany();

    end(metricsLabels);
    return result;
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error('Error getting tasks', error);
    throw error;
  }
}

export async function getTask(id: string, db: DB) {
  const metricsLabels = {
    operation: 'get_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db.query.tasks.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id);
      },
    });

    if (!result) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    end(metricsLabels);
    return result;
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error({ error, id }, 'Error getting task');
    throw error;
  }
}

export async function updateTask(
  id: string,
  input: input<typeof inputSchema.update>,
  db: DB
) {
  const metricsLabels = {
    operation: 'update_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db
      .update(tasks)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!result.length) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    end(metricsLabels);
    return result[0];
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error({ error, id, input }, 'Error updating task');
    throw error;
  }
}

export async function deleteTask(id: string, db: DB) {
  const metricsLabels = {
    operation: 'delete_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    if (!result.length) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    end(metricsLabels);
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error({ error, id }, 'Error deleting task');
    throw error;
  }
}
