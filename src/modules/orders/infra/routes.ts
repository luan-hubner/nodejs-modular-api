import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../../shared/event-bus'
import { PrismaOrderRepository } from './prisma-order.repository'
import { PlaceOrderUseCase } from '../application/use-cases/place-order.use-case'
import { PlaceOrderWithTransactionUseCase } from '../application/use-cases/place-order-with-transaction.use-case'
import { CancelOrderUseCase } from '../application/use-cases/cancel-order.use-case'
import { GetOrderHistoryUseCase } from '../application/use-cases/get-order-history.use-case'
import { OrdersController } from './orders.controller'
import {
  validateBody,
  validateParams,
} from '../../../shared/middleware/validate'
import { placeOrderBodySchema, orderParamsSchema } from './orders.schemas'
import { PrismaProductQueryRepository } from '../../catalog/infra/prisma-product-query.repository'

export async function ordersRoutes(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  const orderRepository = new PrismaOrderRepository()
  const productQueryRepository = new PrismaProductQueryRepository()

  // Use the transactional variant so stock is decremented atomically.
  const placeOrderUseCase = new PlaceOrderWithTransactionUseCase(
    orderRepository,
    options.eventBus,
    productQueryRepository,
  )
  const cancelOrderUseCase = new CancelOrderUseCase(
    orderRepository,
    options.eventBus,
  )
  const getOrderHistoryUseCase = new GetOrderHistoryUseCase(orderRepository)

  const controller = new OrdersController(
    placeOrderUseCase,
    cancelOrderUseCase,
    getOrderHistoryUseCase,
  )

  fastify.post<{
    Body: { items: { productId: string; quantity: number }[] }
  }>(
    '/',
    { preHandler: [fastify.authenticate, validateBody(placeOrderBodySchema)] },
    (req, reply) => controller.handlePlaceOrder(req, reply),
  )

  fastify.patch<{ Params: { id: string } }>(
    '/:id/cancel',
    { preHandler: [fastify.authenticate, validateParams(orderParamsSchema)] },
    (req, reply) => controller.handleCancelOrder(req, reply),
  )

  fastify.get('/', { preHandler: [fastify.authenticate] }, (req, reply) =>
    controller.handleGetOrderHistory(req, reply),
  )
}
