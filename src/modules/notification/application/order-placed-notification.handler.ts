import type { DomainEvent } from '../../../shared/event-bus'
import { OrderPlacedEvent } from '../../orders/domain/events/order-placed.event'
import { createLogger } from '../../../shared/lib/create-logger'

const logger = createLogger('OrderPlacedNotificationHandler')

export class OrderPlacedNotificationHandler {
  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as OrderPlacedEvent
    logger.info(
      {
        orderId: payload.orderId,
        userId: payload.userId,
        total: payload.total,
      },
      'Order confirmed notification sent',
    )
  }
}
