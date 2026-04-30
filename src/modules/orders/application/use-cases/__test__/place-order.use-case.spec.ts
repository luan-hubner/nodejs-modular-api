import { PlaceOrderUseCase } from '../place-order.use-case'
import { Order } from '../../../domain/entities/order.entity'
import { OrderRepository } from '../../../domain/repositories/order.repository'
import {
  IEventBus,
  EventHandler,
  DomainEvent,
} from '../../../../../shared/event-bus'
import type {
  IProductQueryRepository,
  ProductQueryData,
} from '../../../../catalog/domain/repositories/product-query.repository'

class InMemoryProductQueryRepository implements IProductQueryRepository {
  constructor(private readonly products: ProductQueryData[] = []) {}

  async findManyByIds(ids: string[]): Promise<ProductQueryData[]> {
    return this.products.filter((p) => ids.includes(p.id))
  }
}

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

const fakeProduct = (
  id: string,
  stock = 100,
  price = 50,
): ProductQueryData => ({
  id,
  name: `Product ${id}`,
  stock,
  price,
})

describe('PlaceOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let eventBus: FakeEventBus

  const makeSut = (...products: ProductQueryData[]) =>
    new PlaceOrderUseCase(
      orderRepository,
      eventBus,
      new InMemoryProductQueryRepository(products),
    )

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository()
    eventBus = new FakeEventBus()
  })

  it('should place an order with valid items', async () => {
    const sut = makeSut(fakeProduct('prod-1'))

    const { order } = await sut.execute({
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 2 }],
    })

    expect(order.id).toBeDefined()
    expect(order.userId).toBe('user-1')
    expect(order.status).toBe('PENDING')
    expect(order.items).toHaveLength(1)
  })

  it('should persist the order in the repository', async () => {
    const sut = makeSut(fakeProduct('prod-1'))

    const { order } = await sut.execute({
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    const saved = await orderRepository.findById(order.id)
    expect(saved).not.toBeNull()
  })

  it('should throw if no items are provided', async () => {
    const sut = makeSut()

    await expect(sut.execute({ userId: 'user-1', items: [] })).rejects.toThrow(
      'Order must have at least one item',
    )
  })

  it('should throw if a product is not found', async () => {
    const sut = makeSut() // no products in repository

    await expect(
      sut.execute({
        userId: 'user-1',
        items: [{ productId: 'prod-ghost', quantity: 1 }],
      }),
    ).rejects.toThrow('One or more products not found')
  })

  it('should throw if a product has insufficient stock', async () => {
    const sut = makeSut(fakeProduct('prod-1', 3))

    await expect(
      sut.execute({
        userId: 'user-1',
        items: [{ productId: 'prod-1', quantity: 10 }],
      }),
    ).rejects.toThrow('Insufficient stock for product')
  })

  it('should publish an OrderPlacedEvent after placing the order', async () => {
    const sut = makeSut(fakeProduct('prod-1'))

    await sut.execute({
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
    })

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].eventName).toBe('order.placed')
  })

  it('should calculate the correct total', async () => {
    const sut = makeSut(fakeProduct('prod-1', 100, 75))

    const { order } = await sut.execute({
      userId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 3 }],
    })

    expect(order.total).toBe(225)
  })
})
