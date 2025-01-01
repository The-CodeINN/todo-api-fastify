# Task Management API

A robust REST API built with FastifyJS for managing tasks, featuring metrics collection, OpenAPI documentation, and PostgreSQL database integration.

## Features

- RESTful API endpoints for task management
- PostgreSQL database with Drizzle ORM
- OpenAPI documentation (Swagger UI)
- Prometheus metrics collection
- Environment-based configuration
- TypeScript support

## Prerequisites

- Node.js
- PostgreSQL database
- pnpm (recommended) or npm

## Configuration

The application uses environment variables for configuration. Create a `.env` file with the following variables:

```env
PORT=4000                 # API port (default: 4000)
HOST=0.0.0.0             # Host to bind (default: 0.0.0.0)
DATABASE_URL=            # PostgreSQL connection URL
LOG_LEVEL=info           # Logging level (default: info)
METRICS_PREFIX=app_      # Metrics prefix (default: app_)
```

## Installation

```sh
# Install dependencies
pnpm install

# Generate database schema
pnpm run db:migrate

# Run the migrations
pnpm run db:migrate

# Push the migrations to the database
pnpm run db:push

# Open the database studio
pnpm run db:studio
```

## Running the API

```sh
# Development mode
pnpm run dev

# Production mode
pnpm run build
pnpm start
```

## API Documentation

- Swagger UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/docs.json`

## Monitoring

- Health check: `http://localhost:4000/healthcheck`
- Metrics: `http://localhost:4000/metrics`

## Project Structure

```
src/
  ├── config.ts           # Configuration management
  ├── db/                 # Database setup and migrations
  ├── modules/            # Feature modules (tasks, etc.)
  └── utils/
      ├── http.ts         # HTTP utilities
      ├── logger.ts       # Logging setup
      ├── metrics.ts      # Prometheus metrics
      └── server.ts       # Fastify server setup
```

## Built With

- [Fastify](https://fastify.dev/) - Web framework
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Zod](https://zod.dev/) - Schema validation
- [prom-client](https://www.npmjs.com/package/prom-client) - Prometheus metrics

## License

This project is licensed under the MIT License.
