import type { DomainEvent } from '../../../shared/event-bus'
import { OrderCancelledEvent } from '../../orders/domain/events/order-cancelled.event'
import { createLogger } from '../../../shared/lib/create-logger'

const logger = createLogger('OrderCancelledNotificationHandler')

export class OrderCancelledNotificationHandler {
  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as OrderCancelledEvent
    logger.info(
      { orderId: payload.orderId, userId: payload.userId },
      'Order cancelled notification sent',
    )
  }
}
