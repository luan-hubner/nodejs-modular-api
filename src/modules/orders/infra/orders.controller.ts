import { FastifyReply, FastifyRequest } from 'fastify'
import { CancelOrderUseCase } from '../application/use-cases/cancel-order.use-case'
import { GetOrderHistoryUseCase } from '../application/use-cases/get-order-history.use-case'

interface IPlaceOrderUseCase {
  execute(input: {
    userId: string
    items: { productId: string; quantity: number }[]
  }): Promise<{ order: Record<string, unknown> }>
}

export class OrdersController {
  constructor(
    private readonly placeOrder: IPlaceOrderUseCase,
    private readonly cancelOrder: CancelOrderUseCase,
    private readonly getOrderHistory: GetOrderHistoryUseCase,
  ) {}

  async handlePlaceOrder(
    request: FastifyRequest<{
      Body: { items: { productId: string; quantity: number }[] }
    }>,
    reply: FastifyReply,
  ) {
    const { sub: userId } = request.user as { sub: string }
    const { order } = await this.placeOrder.execute({
      userId,
      items: request.body.items,
    })
    return reply.status(201).send({ order })
  }

  async handleCancelOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const { sub: userId } = request.user as { sub: string }
    const { order } = await this.cancelOrder.execute({
      orderId: request.params.id,
      userId,
    })
    return reply.send({ order })
  }

  async handleGetOrderHistory(request: FastifyRequest, reply: FastifyReply) {
    const { sub: userId } = request.user as { sub: string }
    const { orders } = await this.getOrderHistory.execute({ userId })
    return reply.send({ orders })
  }
}
