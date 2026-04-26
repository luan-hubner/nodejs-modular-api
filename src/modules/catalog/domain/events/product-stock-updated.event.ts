import { BaseDomainEvent } from '../../../../shared/event-bus'

interface ProductStockUpdatedEventPayload {
  productId: string
  stock: number
}

export class ProductStockUpdatedEvent extends BaseDomainEvent {
  static readonly EVENT_NAME = 'product.stock_updated'

  constructor(public readonly payload: ProductStockUpdatedEventPayload) {
    super(ProductStockUpdatedEvent.EVENT_NAME)
  }
}
