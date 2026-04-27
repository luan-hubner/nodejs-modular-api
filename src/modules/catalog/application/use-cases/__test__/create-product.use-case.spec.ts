import { CreateProductUseCase } from '../create-product.use-case'
import { Category } from '../../../domain/entities/category.entity'
import { Product } from '../../../domain/entities/product.entity'
import { CategoryRepository } from '../../../domain/repositories/category.repository'
import { ProductRepository } from '../../../domain/repositories/product.repository'
import {
  IEventBus,
  EventHandler,
  DomainEvent,
} from '../../../../../shared/event-bus'

class InMemoryCategoryRepository implements CategoryRepository {
  public categories: Category[] = []

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categories.find((c) => c.name === name) ?? null
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories]
  }

  async save(category: Category): Promise<void> {
    this.categories.push(category)
  }
}

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

describe('CreateProductUseCase', () => {
  let categoryRepository: InMemoryCategoryRepository
  let productRepository: InMemoryProductRepository
  let eventBus: FakeEventBus
  let sut: CreateProductUseCase
  let category: Category

  beforeEach(async () => {
    categoryRepository = new InMemoryCategoryRepository()
    productRepository = new InMemoryProductRepository()
    eventBus = new FakeEventBus()
    sut = new CreateProductUseCase(
      productRepository,
      categoryRepository,
      eventBus,
    )

    category = Category.create({ name: 'Electronics' })
    await categoryRepository.save(category)
  })

  it('should create a product with valid data', async () => {
    const { product } = await sut.execute({
      name: 'Smartphone XYZ',
      description: 'A great phone',
      price: 999.99,
      stock: 50,
      categoryId: category.id,
    })

    expect(product.id).toBeDefined()
    expect(product.name).toBe('Smartphone XYZ')
    expect(product.price).toBe(999.99)
    expect(product.stock).toBe(50)
    expect(product.categoryId).toBe(category.id)
  })

  it('should persist the product in the repository', async () => {
    const { product } = await sut.execute({
      name: 'Smartphone XYZ',
      price: 999.99,
      categoryId: category.id,
    })

    const saved = await productRepository.findById(product.id)
    expect(saved).not.toBeNull()
  })

  it('should default stock to 0 when not provided', async () => {
    const { product } = await sut.execute({
      name: 'Notebook',
      price: 1500,
      categoryId: category.id,
    })

    expect(product.stock).toBe(0)
  })

  it('should throw if the category does not exist', async () => {
    await expect(
      sut.execute({
        name: 'Tablet',
        price: 500,
        categoryId: 'non-existent-id',
      }),
    ).rejects.toThrow('Category not found')
  })

  it('should publish a ProductCreatedEvent after creating', async () => {
    await sut.execute({
      name: 'Headphones',
      price: 200,
      categoryId: category.id,
    })

    expect(eventBus.events).toHaveLength(1)
    expect(eventBus.events[0].eventName).toBe('product.created')
  })
})
