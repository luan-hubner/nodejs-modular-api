import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../shared/event-bus'
import { identityRoutes } from './infra/routes'

export async function identityModule(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  fastify.register(identityRoutes, { prefix: '/auth', ...options })
}
