import { DeleteProductUseCase } from '../delete-product.use-case'
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

describe('DeleteProductUseCase', () => {
  let productRepository: InMemoryProductRepository
  let sut: DeleteProductUseCase
  let existingProduct: Product

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository()
    sut = new DeleteProductUseCase(productRepository)

    existingProduct = Product.create({
      name: 'Smartphone XYZ',
      price: 999.99,
      stock: 50,
      categoryId: 'cat-1',
    })
    await productRepository.save(existingProduct)
  })

  it('should delete an existing product', async () => {
    await sut.execute(existingProduct.id)

    const found = await productRepository.findById(existingProduct.id)
    expect(found).toBeNull()
  })

  it('should throw if the product does not exist', async () => {
    await expect(sut.execute('non-existent-id')).rejects.toThrow(
      'Product not found',
    )
  })
})
