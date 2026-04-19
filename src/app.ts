import Fastify from 'fastify'
import { InMemoryEventBus } from 'src/shared/event-bus'
import { identityModule } from 'src/modules/identity'
import { notificationModule } from 'src/modules/notification'

const app = Fastify()

const eventBus = new InMemoryEventBus()

notificationModule(eventBus)

app.register(identityModule, { eventBus })

export default app
