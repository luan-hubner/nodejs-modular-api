import type { IEventBus } from '../../../../shared/event-bus'
import {
  NotFoundError,
  ForbiddenError,
} from '../../../../shared/errors/app-error'
import { Order } from '../../domain/entities/order.entity'
import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event'
import { OrderRepository } from '../../domain/repositories/order.repository'
import { createLogger } from '../../../../shared/lib/create-logger'

interface CancelOrderInput {
  orderId: string
  userId: string
}

interface CancelOrderOutput {
  order: ReturnType<Order['toJSON']>
}

export class CancelOrderUseCase {
  private readonly logger = createLogger('CancelOrderUseCase')

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orderRepository.findById(input.orderId)

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    if (order.userId !== input.userId) {
      throw new ForbiddenError('Forbidden: order does not belong to user')
    }

    const cancelled = order.cancel()

    await this.orderRepository.update(cancelled)

    this.logger.info(
      { orderId: cancelled.id, userId: cancelled.userId },
      'Order cancelled successfully',
    )

    await this.eventBus.publish(
      new OrderCancelledEvent({
        orderId: cancelled.id,
        userId: cancelled.userId,
      }),
    )

    return { order: cancelled.toJSON() }
  }
}
