import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);
const IdParamsSchema = z.object({
  id: z.coerce.string().openapi({
    param: {
      name: 'id',
      in: 'path',
      required: true,
    },
    required: ['id'],
    example: '4b39f14d-3251-4b1c-8d07-a264c64f9d5e',
  }),
});

export default IdParamsSchema;
