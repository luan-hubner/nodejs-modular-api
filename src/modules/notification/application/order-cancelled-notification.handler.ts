import type { DomainEvent } from '../../../shared/event-bus'
import { OrderCancelledEvent } from '../../orders/domain/events/order-cancelled.event'

export class OrderCancelledNotificationHandler {
  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as OrderCancelledEvent
    console.log(
      `[Notification] Order cancelled: orderId=${payload.orderId}, userId=${payload.userId}`,
    )
  }
}
