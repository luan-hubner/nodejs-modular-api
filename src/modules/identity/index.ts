import { FastifyInstance } from 'fastify'
import { identityRoutes } from './infra/routes'

export async function identityModule(fastify: FastifyInstance) {
  fastify.register(identityRoutes, { prefix: '/auth' })
}
