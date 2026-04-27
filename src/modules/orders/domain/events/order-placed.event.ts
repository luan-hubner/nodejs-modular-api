import { BaseDomainEvent } from '../../../../shared/event-bus'

interface OrderPlacedEventPayload {
  orderId: string
  userId: string
  total: number
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
}

export class OrderPlacedEvent extends BaseDomainEvent {
  static readonly EVENT_NAME = 'order.placed'

  constructor(public readonly payload: OrderPlacedEventPayload) {
    super(OrderPlacedEvent.EVENT_NAME)
  }
}
