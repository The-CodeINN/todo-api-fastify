import { z } from 'zod';
import {
  selectTasksSchema,
  patchTasksSchema,
  insertTasksSchema,
} from '../../db/schema';
import { errorResponses } from '../../utils/http';
import jsonContentRequired from '../../helpers/json-content-required';
import jsonContent from '../../helpers/json-content';
import IdParamsSchema from '../../helpers/id-params';

const tags = ['tasks'] as const;

export const createTaskSchema = {
  tags: tags,
  body: insertTasksSchema,
  response: {
    201: selectTasksSchema,
    ...errorResponses,
  },
} as const;

export const getTasksSchema = {
  tags: tags,
  response: {
    200: jsonContent(z.array(selectTasksSchema), 'List of tasks'),
    ...errorResponses,
  },
} as const;

export const getTaskSchema = {
  tags: tags,
  params: IdParamsSchema,
  response: {
    200: jsonContent(selectTasksSchema, 'The task'),
    ...errorResponses,
  },
} as const;

export const updateTaskSchema = {
  tags: tags,
  params: IdParamsSchema,
  body: jsonContent(patchTasksSchema, 'Task to update'),
  response: {
    200: jsonContent(selectTasksSchema, 'The updated task'),
    ...errorResponses,
  },
} as const;

export const deleteTaskSchema = {
  tags: tags,
  params: IdParamsSchema,
  response: {
    204: {
      description: 'Task deleted',
    },
    ...errorResponses,
  },
} as const;

export type CreateTaskSchema = typeof createTaskSchema;
export type CreateTaskBody = z.infer<typeof insertTasksSchema>;
export type GetTaskParams = z.infer<typeof getTaskSchema.params>;
export type UpdateTaskBody = z.infer<typeof patchTasksSchema>;
export type UpdateTaskParams = z.infer<typeof updateTaskSchema.params>;
export type DeleteTaskParams = z.infer<typeof deleteTaskSchema.params>;
