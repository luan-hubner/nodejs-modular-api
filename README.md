# Node.js modular API

A personal project to study **modular architecture** in Node.js. The goal was to build an API organized into modules with well-defined bounded contexts, where modules don't know about each other directly. All cross-module communication goes through an **Event Bus**.

Not a production project, more of a sandbox to explore these concepts hands-on.

---

## Stack

- **Node.js** + **TypeScript**
- **Fastify** — HTTP framework
- **Prisma** — ORM with PostgreSQL
- **Zod** — schema validation
- **JWT** (`@fastify/jwt`) — authentication
- **Argon2** — password hashing
- **Pino** — structured logging
- **Jest** — unit tests
- **oxlint** — linting

---

## Modules

### `identity`

Everything user-related: registration, login and JWT authentication. Publishes the `user.registered` event after signup.

### `catalog`

Manages products and categories. Simple CRUD with authentication.

### `orders`

Order lifecycle: create, cancel and list. Publishes `order.placed` and `order.cancelled` events.

### `notification`

A passive module. It only listens to events and reacts to them (welcome email on registration, notifications on orders). Nothing calls it directly.

---

## Architecture

Each module follows a layered structure:

```
modules/<name>/
├── domain/       # entities, business rules, repository interfaces
├── application/  # use cases
├── infra/        # controllers, routes, Prisma repositories
└── index.ts      # module's public API
```

The main rule: **modules never import each other's internals**. If module A needs to react to something module B did, that happens through an event.

---

## Event Bus

Implemented in two ways:

- **`InMemoryEventBus`** — simple, synchronous, in-memory handlers
- **`OutboxEventBus`** — implements the [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html), persists events to the database before publishing, with a background worker that processes the queue

The `OutboxEventBus` wraps the in-memory bus, ensuring no event is lost even if a handler fails.

## Disclaimer

A Broker like Redis or RabbitMQ would be ideal for the event approach to avoid duplicate events and ensure delivery.

But for simplicity and study purposes I'm using a polling mechanism.

---

## Running the project

**Requirements:** Node.js 20+, PostgreSQL

```bash
# install dependencies
npm install

# set up environment
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET

# run migrations
npx prisma migrate dev

# start in dev mode
npm run start:dev
```

---

## Tests

```bash
npm test
npm run test:watch
```

---

## CI

Three GitHub Actions workflows:

- **CI** — runs tests on every push/PR
- **Lint** — checks the code with oxlint
- **Security** — dependency audit
