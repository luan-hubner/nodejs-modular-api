import { ListProductsUseCase } from '../list-products.use-case'
import { Product } from '../../../domain/entities/product.entity'
import { ProductRepository } from '../../../domain/repositories/product.repository'

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

describe('ListProductsUseCase', () => {
  let productRepository: InMemoryProductRepository
  let sut: ListProductsUseCase

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository()
    sut = new ListProductsUseCase(productRepository)

    await productRepository.save(
      Product.create({ name: 'Smartphone', price: 999, categoryId: 'cat-1' }),
    )
    await productRepository.save(
      Product.create({ name: 'Notebook', price: 1500, categoryId: 'cat-1' }),
    )
    await productRepository.save(
      Product.create({
        name: 'Book TypeScript',
        price: 50,
        categoryId: 'cat-2',
      }),
    )
  })

  it('should return all products when no filter is provided', async () => {
    const { products } = await sut.execute()

    expect(products).toHaveLength(3)
  })

  it('should filter products by categoryId', async () => {
    const { products } = await sut.execute({ categoryId: 'cat-1' })

    expect(products).toHaveLength(2)
    expect(products.every((p) => p.categoryId === 'cat-1')).toBe(true)
  })

  it('should return an empty list when no products match the filter', async () => {
    const { products } = await sut.execute({ categoryId: 'cat-999' })

    expect(products).toHaveLength(0)
  })

  it('should return products with correct fields', async () => {
    const { products } = await sut.execute()

    for (const product of products) {
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('stock')
      expect(product).toHaveProperty('categoryId')
    }
  })
})
