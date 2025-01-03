import { taskRouter } from '../modules/tasks/task.router';
import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { promises as fs } from 'fs';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import fastifyStatic from '@fastify/static';
import fastifyRateLimit from '@fastify/rate-limit';

import { version } from '../../package.json';
import { config } from '../config';
import {
  prom,
  reqReplyTime,
  rateLimitHitsCounter,
  rateLimitBlocksCounter,
  rateLimitBansCounter,
} from './metrics';
import path from 'path';
import { DB } from '../db';

declare module 'fastify' {
  interface FastifyRequest {
    db: DB;
  }
}

export async function buildServer({ db }: { db: DB }) {
  const fastify = Fastify({
    logger: true,
  });

  // Serve static files from public directory
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
  });

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Add rate limiting
  await fastify.register(fastifyRateLimit, {
    max: config.RATE_LIMIT.MAX,
    timeWindow: config.RATE_LIMIT.TIME_WINDOW,
    ban: 3,
    skipOnError: true,
    hook: 'preHandler',
    keyGenerator: (req) => {
      return (
        (Array.isArray(req.headers['x-api-key'])
          ? req.headers['x-api-key'][0]
          : req.headers['x-api-key']) || req.ip
      );
    },
    enableDraftSpec: true,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });

  // Specific rate limit for API docs
  fastify.register(async function (fastify) {
    await fastify.register(fastifyRateLimit, {
      max: 30,
      timeWindow: 60 * 1000,
      prefix: '/docs',
    });
  });

  fastify.addHook('onRequest', async (req) => {
    req.db = db;
  });

  fastify.addHook('onResponse', reqReplyTime);

  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Todo API',
        description: 'A simple todo API',
        version,
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: 'Development server',
        },
        {
          url: `https://todo-api-fastify-production.up.railway.app/`,
          description: 'Production server',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'obsidian',
      },
    },
    theme: {
      title: 'Todo API Documentation',
      favicon: [
        {
          filename: 'favicon-32x32.png',
          rel: 'icon',
          sizes: '32x32',
          type: 'image/png',
          content: await fs.readFile(
            path.join(process.cwd(), 'public/favicon-32x32.png')
          ),
        },
        {
          filename: 'favicon-16x16.png',
          rel: 'icon',
          sizes: '16x16',
          type: 'image/png',
          content: await fs.readFile(
            path.join(process.cwd(), 'public/favicon-16x16.png')
          ),
        },
      ],
      css: [
        {
          filename: 'custom.css',
          content: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info { margin: 20px 0 }
            .swagger-ui .info .title { color: #2c3e50 }
            .swagger-ui .opblock-tag { font-size: 18px }
            .swagger-ui .opblock { margin: 0 0 15px }
            .swagger-ui section.models { margin: 30px 0 }
          `,
        },
      ],
    },
  });

  fastify.after(() => {
    fastify.register(taskRouter, { prefix: '/v1' });

    fastify.get('/docs.json', async () => {
      return fastify.swagger();
    });

    fastify.get('/metrics', async (_, reply) => {
      reply.header('Content-Type', prom.register.contentType);

      return prom.register.metrics();
    });

    fastify.get('/healthcheck', async () => {
      return { status: 'ok' };
    });
  });

  return fastify;
}
