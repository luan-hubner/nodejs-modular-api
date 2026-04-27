import { FastifyReply, FastifyRequest } from 'fastify'
import { PlaceOrderUseCase } from '../application/use-cases/place-order.use-case'
import { CancelOrderUseCase } from '../application/use-cases/cancel-order.use-case'
import { GetOrderHistoryUseCase } from '../application/use-cases/get-order-history.use-case'

export class OrdersController {
  constructor(
    private readonly placeOrder: PlaceOrderUseCase,
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
