import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { InMemoryEventBus } from 'src/shared/event-bus'
import { identityModule } from 'src/modules/identity'
import { notificationModule } from 'src/modules/notification'
import { catalogModule } from 'src/modules/catalog'

const app = Fastify()

const eventBus = new InMemoryEventBus()

notificationModule(eventBus)

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

export default app
