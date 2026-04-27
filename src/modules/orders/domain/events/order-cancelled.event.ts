import { BaseDomainEvent } from '../../../../shared/event-bus'

interface OrderCancelledEventPayload {
  orderId: string
  userId: string
}

export class OrderCancelledEvent extends BaseDomainEvent {
  static readonly EVENT_NAME = 'order.cancelled'

  constructor(public readonly payload: OrderCancelledEventPayload) {
    super(OrderCancelledEvent.EVENT_NAME)
  }
}
