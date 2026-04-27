import type { DomainEvent } from '../../../shared/event-bus'
import { OrderPlacedEvent } from '../../orders/domain/events/order-placed.event'

export class OrderPlacedNotificationHandler {
  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as OrderPlacedEvent
    console.log(
      `[Notification] Order confirmed: orderId=${payload.orderId}, userId=${payload.userId}, total=${payload.total}`,
    )
  }
}
