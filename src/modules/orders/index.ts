import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../shared/event-bus'
import { ordersRoutes } from './infra/routes'
import { PrismaOrderRepository } from './infra/prisma-order.repository'
import { CancelUserOrdersHandler } from './application/handlers/cancel-user-orders.handler'

const USER_DELETED_EVENT = 'user.deleted'

export async function ordersModule(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  // Subscribe to user.deleted to cancel active orders
  const orderRepository = new PrismaOrderRepository()
  const cancelUserOrdersHandler = new CancelUserOrdersHandler(
    orderRepository,
    options.eventBus,
  )

  options.eventBus.subscribe(
    USER_DELETED_EVENT,
    cancelUserOrdersHandler.handle.bind(cancelUserOrdersHandler),
  )

  fastify.register(ordersRoutes, { prefix: '/orders', ...options })
}
