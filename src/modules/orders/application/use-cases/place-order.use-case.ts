import type { IEventBus } from '../../../../shared/event-bus'
import { Order } from '../../domain/entities/order.entity'
import { OrderItem } from '../../domain/entities/order-item.entity'
import { OrderPlacedEvent } from '../../domain/events/order-placed.event'
import { OrderRepository } from '../../domain/repositories/order.repository'
import type { IProductQueryRepository } from '../../../catalog/domain/repositories/product-query.repository'

interface PlaceOrderInput {
  userId: string
  items: { productId: string; quantity: number }[]
}

interface PlaceOrderOutput {
  order: ReturnType<Order['toJSON']>
}

export class PlaceOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly eventBus: IEventBus,
    private readonly productQueryRepository: IProductQueryRepository,
  ) {}

  async execute(input: PlaceOrderInput): Promise<PlaceOrderOutput> {
    if (!input.items || input.items.length === 0) {
      throw new Error('Order must have at least one item')
    }

    const productIds = input.items.map((i) => i.productId)

    const products = await this.productQueryRepository.findManyByIds(productIds)

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found')
    }

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of input.items) {
      const product = productMap.get(item.productId)!
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}`,
        )
      }
    }

    const orderItems = input.items.map((item) => {
      const product = productMap.get(item.productId)!
      return OrderItem.create({
        orderId: '', // will be set below
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      })
    })

    const order = Order.create({ userId: input.userId, items: [] })

    // Recreate items with the real orderId
    const finalItems = orderItems.map((item) =>
      OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    )

    const finalOrder = Order.restore({
      id: order.id,
      userId: order.userId,
      status: order.status,
      items: finalItems,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })

    await this.orderRepository.save(finalOrder)

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
