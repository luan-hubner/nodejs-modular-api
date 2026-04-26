import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../shared/event-bus'
import { catalogRoutes } from './infra/routes'

export async function catalogModule(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  fastify.register(catalogRoutes, { prefix: '/catalog', ...options })
}
