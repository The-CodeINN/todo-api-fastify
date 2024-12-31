import { InferInsertModel, and, eq } from 'drizzle-orm';
import { tasks } from '../../db/schema';
import {
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

export async function createTask(
  input: input<typeof inputSchema.create>,
  db: DB
) {
  const metricsLabels = {
    operations: 'create_task',
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
    operations: 'get_tasks',
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

export async function getTask(id: number, db: DB) {
  const metricsLabels = {
    operations: 'get_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db.query.tasks.findFirst({
      where(fields, operators) {
        return operators.eq(fields.id, id.toString());
      },
    });

    end(metricsLabels);
    return result;
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error('Error getting task', error);
    throw error;
  }
}

export async function updateTask(
  id: number,
  input: input<typeof inputSchema.update>,
  db: DB
) {
  const metricsLabels = {
    operations: 'update_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    const result = await db
      .update(tasks)
      .set(input)
      .where(and(eq(tasks.id, id.toString())))
      .returning();

    end(metricsLabels);
    return result[0];
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error('Error updating task', error);
    throw error;
  }
}

export async function deleteTask(id: number, db: DB) {
  const metricsLabels = {
    operations: 'delete_task',
    success: 'true',
  };
  const end = databaseQueryTimeHistogram.startTimer();

  try {
    await db.delete(tasks).where(and(eq(tasks.id, id.toString())));

    end(metricsLabels);
  } catch (error) {
    end({ ...metricsLabels, success: 'false' });
    logger.error('Error deleting task', error);
    throw error;
  }
}
