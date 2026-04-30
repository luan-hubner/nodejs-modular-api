import { randomUUID } from 'crypto'
import type { IEventBus } from '../../../../shared/event-bus'
import {
  NotFoundError,
  ValidationError,
  AppError,
} from '../../../../shared/errors'
import { Order } from '../../domain/entities/order.entity'
import { OrderItem } from '../../domain/entities/order-item.entity'
import { OrderPlacedEvent } from '../../domain/events/order-placed.event'
import { OrderRepository } from '../../domain/repositories/order.repository'
import type { IProductQueryRepository } from '../../../catalog/domain/repositories/product-query.repository'
import { createLogger } from '../../../../shared/lib/create-logger'

interface PlaceOrderInput {
  userId: string
  items: { productId: string; quantity: number }[]
}

interface PlaceOrderOutput {
  order: ReturnType<Order['toJSON']>
}

export class PlaceOrderUseCase {
  private readonly logger = createLogger('PlaceOrderUseCase')

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: IEventBus,
    private readonly productQueryRepository: IProductQueryRepository,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('Order must have at least one item')
    }

    const productIds = input.items.map((i) => i.productId)

    const products = await this.productQueryRepository.findManyByIds(productIds)

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more products not found')
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of input.items) {
      const product = productMap.get(item.productId)!
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}`,
          409,
          'INSUFFICIENT_STOCK',
        )
      }
    }

    const orderId = randomUUID()

    const finalItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!
      return OrderItem.create({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      })
    })

    const now = new Date()
    const finalOrder = Order.restore({
      id: orderId,
      userId: input.userId,
      status: 'PENDING',
      items: finalItems,
      createdAt: now,
      updatedAt: now,
    })

    await this.orderRepository.save(finalOrder)

    this.logger.info(
      { orderId: finalOrder.id, userId: finalOrder.userId },
      'Order placed successfully',
    )

    await this.eventBus.publish(
      new OrderPlacedEvent({
        orderId: finalOrder.id,
        userId: finalOrder.userId,
        total: finalOrder.total,
        items: finalItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      }),
    )

    return { order: finalOrder.toJSON() }
  }
}
