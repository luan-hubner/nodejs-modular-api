import { CancelOrderUseCase } from '../cancel-order.use-case'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'
import { OrderRepository } from '../../../domain/repositories/order.repository'
import {
  IEventBus,
  EventHandler,
  DomainEvent,
} from '../../../../../shared/event-bus'

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

class FakeEventBus implements IEventBus {
  public events: DomainEvent[] = []

  async publish(event: DomainEvent): Promise<void> {
    this.events.push(event)
  }

  subscribe(_eventName: string, _handler: EventHandler): void {}
  unsubscribe(_eventName: string, _handler: EventHandler): void {}
}

function makePendingOrder(userId: string): Order {
  const item = OrderItem.create({
    orderId: 'order-temp',
    productId: 'prod-1',
    quantity: 1,
    unitPrice: 200,
  })
  return Order.create({ userId, items: [item] })
}

describe('CancelOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let eventBus: FakeEventBus
  let sut: CancelOrderUseCase
  let pendingOrder: Order

  beforeEach(async () => {
    orderRepository = new InMemoryOrderRepository()
    eventBus = new FakeEventBus()
    sut = new CancelOrderUseCase(orderRepository, eventBus)

    pendingOrder = makePendingOrder('user-1')
    await orderRepository.save(pendingOrder)
  })

  it('should cancel a PENDING order', async () => {
    const { order } = await sut.execute({
      orderId: pendingOrder.id,
      userId: 'user-1',
    })

    expect(order.status).toBe('CANCELLED')
  })

  it('should persist the cancelled status', async () => {
    await sut.execute({ orderId: pendingOrder.id, userId: 'user-1' })

    const saved = await orderRepository.findById(pendingOrder.id)
    expect(saved?.status).toBe('CANCELLED')
  })

  it('should throw if the order does not exist', async () => {
    await expect(
      sut.execute({ orderId: 'non-existent-id', userId: 'user-1' }),
    ).rejects.toThrow('Order not found')
  })

  it('should throw if the order does not belong to the user', async () => {
    await expect(
      sut.execute({ orderId: pendingOrder.id, userId: 'other-user' }),
    ).rejects.toThrow('Forbidden: order does not belong to user')
  })

  it('should throw if the order is already CANCELLED', async () => {
    await sut.execute({ orderId: pendingOrder.id, userId: 'user-1' })

    await expect(
      sut.execute({ orderId: pendingOrder.id, userId: 'user-1' }),
    ).rejects.toThrow('Only PENDING orders can be cancelled')
  })

  it('should publish an OrderCancelledEvent', async () => {
    await sut.execute({ orderId: pendingOrder.id, userId: 'user-1' })

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].eventName).toBe('order.cancelled')
  })
})
