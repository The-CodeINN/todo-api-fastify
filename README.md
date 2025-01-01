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

## Monitoring & Observability

### Logging

- Structured JSON logging
- Log levels (debug, info, warn, error)
- Request/Response correlation IDs
- Performance metrics logging

### Metrics Collection

The application uses Prometheus and Grafana for metrics visualization:

```sh
# Start monitoring stack
docker compose up -d prometheus grafana
```

Access points:

- Grafana: `http://localhost:3000` (admin/password)
- Prometheus: `http://localhost:9090`

Available metrics:

- HTTP request counts and latencies
- Database query performance
- Node.js runtime metrics (memory, CPU, GC)
- Custom business metrics

### ⚠️ Security Considerations

The metrics endpoint (`/metrics`) should NOT be publicly exposed because:

1. Potential DoS vector through frequent polling
2. Exposes internal system information
3. High resource consumption for metric generation

Best practices:

- Use separate port for metrics
- Implement authentication
- Use reverse proxy with IP whitelist
- Set rate limits

Example secure nginx configuration:

```nginx
location /metrics {
    auth_basic "Metrics";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:4000;
    allow 10.0.0.0/8;  # Internal network
    deny all;
}
```

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
