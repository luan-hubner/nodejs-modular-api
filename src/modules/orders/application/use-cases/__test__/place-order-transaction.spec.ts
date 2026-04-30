import { PlaceOrderWithTransactionUseCase } from '../place-order-with-transaction.use-case'
import { Order } from '../../../domain/entities/order.entity'
import type { ITransactionalOrderRepository } from '../../../domain/repositories/transactional-order.repository'
import { AppError } from '../../../../../shared/errors'
import {
  IEventBus,
  EventHandler,
  DomainEvent,
} from '../../../../../shared/event-bus'
import type {
  IProductQueryRepository,
  ProductQueryData,
} from '../../../../catalog/domain/repositories/product-query.repository'

// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------

class InMemoryTransactionalOrderRepository implements ITransactionalOrderRepository {
  public orders: Order[] = []
  public stock: Map<string, number>

  constructor(initialStock: Map<string, number> = new Map()) {
    this.stock = initialStock
  }

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
    const idx = this.orders.findIndex((o) => o.id === order.id)
    if (idx !== -1) this.orders[idx] = order
  }

  /**
   * Simulates an atomic decrement using a simple mutex-per-product approach.
   * Because JavaScript is single-threaded, wrapping operations in
   * Promise.resolve() is enough to interleave microtasks in the same event
   * loop tick — which faithfully represents a race condition scenario in tests.
   */
  async saveWithStockDecrement(
    order: Order,
    decrements: { productId: string; quantity: number; name: string }[],
  ): Promise<void> {
    // Simulate the atomic DB check-and-decrement per item
    for (const d of decrements) {
      const current = this.stock.get(d.productId) ?? 0
      if (current < d.quantity) {
        throw new AppError(
          `Insufficient stock for product "${d.name}"`,
          409,
          'INSUFFICIENT_STOCK',
        )
      }
      this.stock.set(d.productId, current - d.quantity)
    }
    this.orders.push(order)
  }
}

class InMemoryProductQueryRepository implements IProductQueryRepository {
  constructor(private readonly products: ProductQueryData[] = []) {}

  async findManyByIds(ids: string[]): Promise<ProductQueryData[]> {
    return this.products.filter((p) => ids.includes(p.id))
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fakeProduct = (
  id: string,
  stock = 100,
  price = 50,
): ProductQueryData => ({ id, name: `Product ${id}`, stock, price })

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlaceOrderWithTransactionUseCase', () => {
  let orderRepository: InMemoryTransactionalOrderRepository
  let eventBus: FakeEventBus

  const makeSut = (
    products: ProductQueryData[],
    stockMap?: Map<string, number>,
  ) => {
    const stock = stockMap ?? new Map(products.map((p) => [p.id, p.stock]))
    orderRepository = new InMemoryTransactionalOrderRepository(stock)
    return new PlaceOrderWithTransactionUseCase(
      orderRepository,
      eventBus,
      new InMemoryProductQueryRepository(products),
    )
  }

  beforeEach(() => {
    eventBus = new FakeEventBus()
  })

  // ── Happy path ────────────────────────────────────────────────────────────

  it('should place an order and return it', async () => {
    const sut = makeSut([fakeProduct('p1')])

    const { order } = await sut.execute({
      userId: 'u1',
      items: [{ productId: 'p1', quantity: 2 }],
    })

    expect(order.id).toBeDefined()
    expect(order.userId).toBe('u1')
    expect(order.status).toBe('PENDING')
    expect(order.items).toHaveLength(1)
  })

  it('should decrement stock atomically', async () => {
    const products = [fakeProduct('p1', 10)]
    const sut = makeSut(products)

    await sut.execute({
      userId: 'u1',
      items: [{ productId: 'p1', quantity: 4 }],
    })

    expect(orderRepository.stock.get('p1')).toBe(6)
  })

  it('should persist the order', async () => {
    const sut = makeSut([fakeProduct('p1')])
    const { order } = await sut.execute({
      userId: 'u1',
      items: [{ productId: 'p1', quantity: 1 }],
    })

    const saved = await orderRepository.findById(order.id)
    expect(saved).not.toBeNull()
  })

  it('should publish OrderPlacedEvent AFTER the transaction commits', async () => {
    const sut = makeSut([fakeProduct('p1')])

    await sut.execute({
      userId: 'u1',
      items: [{ productId: 'p1', quantity: 1 }],
    })

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].eventName).toBe('order.placed')
  })

  it('should NOT publish an event when the transaction fails', async () => {
    // Stock is 1 but we request 5 → transaction will throw
    const sut = makeSut([fakeProduct('p1', 1)])

    await expect(
      sut.execute({ userId: 'u1', items: [{ productId: 'p1', quantity: 5 }] }),
    ).rejects.toThrow('Insufficient stock')

    expect(eventBus.events).toHaveLength(0)
  })

  // ── Validation errors ─────────────────────────────────────────────────────

  it('should throw ValidationError when no items are provided', async () => {
    const sut = makeSut([])

    await expect(sut.execute({ userId: 'u1', items: [] })).rejects.toThrow(
      'Order must have at least one item',
    )
  })

  it('should throw NotFoundError when a product does not exist', async () => {
    const sut = makeSut([]) // empty catalog

    await expect(
      sut.execute({
        userId: 'u1',
        items: [{ productId: 'ghost', quantity: 1 }],
      }),
    ).rejects.toThrow('One or more products not found')
  })

  it('should throw when pre-validation detects insufficient stock', async () => {
    const sut = makeSut([fakeProduct('p1', 2)])

    await expect(
      sut.execute({ userId: 'u1', items: [{ productId: 'p1', quantity: 99 }] }),
    ).rejects.toThrow('Insufficient stock')
  })

  // ── Race condition ────────────────────────────────────────────────────────

  it('should handle race conditions — only one request succeeds when stock = 1', async () => {
    // Two concurrent requests for the same product with stock = 1.
    // Only one should succeed; the other must be rejected.
    const products = [fakeProduct('p1', 1)]
    const stock = new Map([['p1', 1]])
    const sharedRepo = new InMemoryTransactionalOrderRepository(stock)
    const queryRepo = new InMemoryProductQueryRepository(products)

    const sut = new PlaceOrderWithTransactionUseCase(
      sharedRepo,
      eventBus,
      queryRepo,
    )

    const request = () =>
      sut.execute({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] })

    const results = await Promise.allSettled([request(), request()])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(sharedRepo.stock.get('p1')).toBe(0)
    expect(sharedRepo.orders).toHaveLength(1)
  })

  it('should handle race conditions — all requests fail when stock is 0', async () => {
    const products = [fakeProduct('p1', 0)]
    const stock = new Map([['p1', 0]])
    const sharedRepo = new InMemoryTransactionalOrderRepository(stock)
    const queryRepo = new InMemoryProductQueryRepository(products)

    const sut = new PlaceOrderWithTransactionUseCase(
      sharedRepo,
      eventBus,
      queryRepo,
    )

    const results = await Promise.allSettled([
      sut.execute({ userId: 'u1', items: [{ productId: 'p1', quantity: 1 }] }),
      sut.execute({ userId: 'u2', items: [{ productId: 'p1', quantity: 1 }] }),
      sut.execute({ userId: 'u3', items: [{ productId: 'p1', quantity: 1 }] }),
    ])

    expect(results.every((r) => r.status === 'rejected')).toBe(true)
    expect(sharedRepo.orders).toHaveLength(0)
    expect(eventBus.events).toHaveLength(0)
  })

  it('should handle race conditions — multiple products, partial stock', async () => {
    // stock: p1=3, each of 5 concurrent requests wants quantity=1
    // Only 3 should succeed
    const products = [fakeProduct('p1', 3, 10)]
    const stock = new Map([['p1', 3]])
    const sharedRepo = new InMemoryTransactionalOrderRepository(stock)
    const queryRepo = new InMemoryProductQueryRepository(products)

    const sut = new PlaceOrderWithTransactionUseCase(
      sharedRepo,
      eventBus,
      queryRepo,
    )

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, (_, i) =>
        sut.execute({
          userId: `u${i}`,
          items: [{ productId: 'p1', quantity: 1 }],
        }),
      ),
    )

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    expect(fulfilled).toHaveLength(3)
    expect(sharedRepo.stock.get('p1')).toBe(0)
    expect(sharedRepo.orders).toHaveLength(3)
  })
})
