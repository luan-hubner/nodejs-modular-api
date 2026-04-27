import type { IEventBus } from '../../../../shared/event-bus'
import { Order } from '../../domain/entities/order.entity'
import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event'
import { OrderRepository } from '../../domain/repositories/order.repository'

interface CancelOrderInput {
  orderId: string
  userId: string
}

interface CancelOrderOutput {
  order: ReturnType<Order['toJSON']>
}

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId)

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.userId !== input.userId) {
      throw new Error('Forbidden: order does not belong to user')
    }

    const cancelled = order.cancel()

    await this.orderRepository.update(cancelled)

    await this.eventBus.publish(
      new OrderCancelledEvent({
        orderId: cancelled.id,
        userId: cancelled.userId,
      }),
    )

    return { order: cancelled.toJSON() }
  }
}
