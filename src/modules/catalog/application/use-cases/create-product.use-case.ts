import type { IEventBus } from '../../../../shared/event-bus'
import { Product } from '../../domain/entities/product.entity'
import { ProductCreatedEvent } from '../../domain/events/product-created.event'
import { CategoryRepository } from '../../domain/repositories/category.repository'
import { ProductRepository } from '../../domain/repositories/product.repository'

interface CreateProductInput {
  name: string
  description?: string
  price: number
  stock?: number
  categoryId: string
}

interface CreateProductOutput {
  product: ReturnType<Product['toJSON']>
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const category = await this.categoryRepository.findById(input.categoryId)

    if (!category) {
      throw new Error('Category not found')
    }

    const product = Product.create(input)

    await this.productRepository.save(product)

    await this.eventBus.publish(
      new ProductCreatedEvent({
        productId: product.id,
        name: product.name,
        categoryId: product.categoryId,
      }),
    )

    return { product: product.toJSON() }
  }
}
