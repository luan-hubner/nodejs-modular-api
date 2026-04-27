import type { DomainEvent, IEventBus } from '../../../../shared/event-bus'
import { OrderCancelledEvent } from '../../domain/events/order-cancelled.event'
import { OrderRepository } from '../../domain/repositories/order.repository'

interface UserDeletedEventPayload {
  userId: string
}

export class CancelUserOrdersHandler {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as unknown as { payload: UserDeletedEventPayload }
    const activeOrders = await this.orderRepository.findActivByUserId(
      payload.userId,
    )

    for (const order of activeOrders) {
      const cancelled = order.cancel()
      await this.orderRepository.update(cancelled)
      await this.eventBus.publish(
        new OrderCancelledEvent({
          orderId: cancelled.id,
          userId: cancelled.userId,
        }),
      )
    }
  }
}
