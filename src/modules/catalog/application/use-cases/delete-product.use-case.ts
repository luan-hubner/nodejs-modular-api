import { ProductRepository } from '../../domain/repositories/product.repository'

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id)

    if (!existing) {
      throw new Error('Product not found')
    }

    await this.productRepository.delete(id)
  }
}
