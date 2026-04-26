import { Product } from '../../domain/entities/product.entity'
import { ProductRepository } from '../../domain/repositories/product.repository'

interface ListProductsInput {
  categoryId?: string
}

interface ListProductsOutput {
  products: ReturnType<Product['toJSON']>[]
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(filters: ListProductsInput = {}): Promise<ListProductsOutput> {
    const products = await this.productRepository.findAll(filters)

    return { products: products.map((p) => p.toJSON()) }
  }
}
