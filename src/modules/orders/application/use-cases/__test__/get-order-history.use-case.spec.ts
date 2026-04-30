import { GetOrderHistoryUseCase } from '../get-order-history.use-case'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'
import { OrderRepository } from '../../../domain/repositories/order.repository'

class InMemoryOrderRepository implements OrderRepository {
  public orders: Order[] = []

  async findById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId)
  }

  async findActivByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter(
      (o) => o.userId === userId && o.status === 'PENDING',
    )
  }

  async save(order: Order): Promise<void> {
    this.orders.push(order)
  }

  async update(order: Order): Promise<void> {
    const index = this.orders.findIndex((o) => o.id === order.id)
    if (index !== -1) this.orders[index] = order
  }
}

function makeOrderWithItems(userId: string): Order {
  const item = OrderItem.create({
    orderId: 'order-temp',
    productId: 'prod-1',
    quantity: 2,
    unitPrice: 100,
  })
  return Order.create({ userId, items: [item] })
}

describe('GetOrderHistoryUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let sut: GetOrderHistoryUseCase

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository()
    sut = new GetOrderHistoryUseCase(orderRepository)

    await orderRepository.save(makeOrderWithItems('user-1'))
    await orderRepository.save(makeOrderWithItems('user-1'))
    await orderRepository.save(makeOrderWithItems('user-2'))
  })

  it('should return all orders for the given user', async () => {
    const { orders } = await sut.execute({ userId: 'user-1' })

    expect(orders).toHaveLength(2)
    expect(orders.every((o) => o.userId === 'user-1')).toBe(true)
  })

  it('should return an empty list when user has no orders', async () => {
    const { orders } = await sut.execute({ userId: 'user-999' })

    expect(orders).toHaveLength(0)
  })

  it('should return orders with correct fields', async () => {
    const { orders } = await sut.execute({ userId: 'user-1' })

    for (const order of orders) {
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('userId')
      expect(order).toHaveProperty('status')
      expect(order).toHaveProperty('items')
      expect(order).toHaveProperty('total')
    }
  })
})
