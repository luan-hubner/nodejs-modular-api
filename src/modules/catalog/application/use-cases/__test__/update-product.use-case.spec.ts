import { UpdateProductUseCase } from '../update-product.use-case'
import { Product } from '../../../domain/entities/product.entity'
import { ProductRepository } from '../../../domain/repositories/product.repository'
import {
  IEventBus,
  EventHandler,
  DomainEvent,
} from '../../../../../shared/event-bus'

class InMemoryProductRepository implements ProductRepository {
  public products: Product[] = []

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null
  }

  async findAll(filters?: { categoryId?: string }): Promise<Product[]> {
    if (filters?.categoryId) {
      return this.products.filter((p) => p.categoryId === filters.categoryId)
    }
    return [...this.products]
  }

  async save(product: Product): Promise<void> {
    this.products.push(product)
  }

  async update(product: Product): Promise<void> {
    const index = this.products.findIndex((p) => p.id === product.id)
    if (index !== -1) this.products[index] = product
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id)
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

describe('UpdateProductUseCase', () => {
  let productRepository: InMemoryProductRepository
  let eventBus: FakeEventBus
  let sut: UpdateProductUseCase
  let existingProduct: Product

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository()
    eventBus = new FakeEventBus()
    sut = new UpdateProductUseCase(productRepository, eventBus)

    existingProduct = Product.create({
      name: 'Smartphone XYZ',
      price: 999.99,
      stock: 50,
      categoryId: 'cat-1',
    })
    await productRepository.save(existingProduct)
  })

  it('should update product fields', async () => {
    const { product } = await sut.execute({
      id: existingProduct.id,
      name: 'Smartphone XYZ Pro',
      price: 1099.99,
    })

    expect(product.name).toBe('Smartphone XYZ Pro')
    expect(product.price).toBe(1099.99)
    expect(product.stock).toBe(50)
  })

  it('should persist the updated product', async () => {
    await sut.execute({ id: existingProduct.id, name: 'Updated Name' })

    const saved = await productRepository.findById(existingProduct.id)
    expect(saved?.name).toBe('Updated Name')
  })

  it('should throw if the product does not exist', async () => {
    await expect(
      sut.execute({ id: 'non-existent-id', name: 'Ghost' }),
    ).rejects.toThrow('Product not found')
  })

  it('should publish ProductStockUpdatedEvent when stock changes', async () => {
    await sut.execute({ id: existingProduct.id, stock: 30 })

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].eventName).toBe('product.stock_updated')
  })

  it('should NOT publish event when stock does not change', async () => {
    await sut.execute({ id: existingProduct.id, name: 'New Name' })

    expect(eventBus.events).toHaveLength(0)
  })

  it('should NOT publish event when stock value is the same', async () => {
    await sut.execute({ id: existingProduct.id, stock: 50 })

    expect(eventBus.events).toHaveLength(0)
  })
})
