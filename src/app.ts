import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import {
  InMemoryEventBus,
  OutboxEventBus,
  OutboxWorker,
} from 'src/shared/event-bus'
import { identityModule } from 'src/modules/identity'
import { notificationModule } from 'src/modules/notification'
import { catalogModule } from 'src/modules/catalog'
import { ordersModule } from 'src/modules/orders'
import { errorHandler } from 'src/shared/middleware/error-handler'

const isDev = process.env.NODE_ENV !== 'production'

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
})

const inMemoryBus = new InMemoryEventBus()
const eventBus = new OutboxEventBus(inMemoryBus)

notificationModule(eventBus)

const outboxWorker = new OutboxWorker(inMemoryBus)
outboxWorker.start()

process.on('SIGTERM', () => outboxWorker.stop())
process.on('SIGINT', () => outboxWorker.stop())

app.register(fastifyHelmet)
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
})

app.decorate(
  'authenticate',
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  },
)

app.register(identityModule, { eventBus })
app.register(catalogModule, { eventBus })
app.register(ordersModule, { eventBus })

app.setErrorHandler(errorHandler)

export default app
