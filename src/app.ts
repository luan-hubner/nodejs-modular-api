import Fastify from 'fastify'
import { identityModule } from 'src/modules/identity'

const app = Fastify()

app.register(identityModule)

export default app
