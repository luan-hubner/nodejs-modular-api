import Fastify from 'fastify'

const app = Fastify()

app.get('/ping', async (request, reply) => {
  return 'pong'
})

export default app
