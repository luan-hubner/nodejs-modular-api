import { BaseDomainEvent } from '../../../../shared/event-bus'

interface ProductCreatedEventPayload {
  productId: string
  name: string
  categoryId: string
}

export class ProductCreatedEvent extends BaseDomainEvent {
  static readonly EVENT_NAME = 'product.created'

  constructor(public readonly payload: ProductCreatedEventPayload) {
    super(ProductCreatedEvent.EVENT_NAME)
  }
}
