import type { IEventBus } from '../../../../shared/event-bus'
import { NotFoundError } from '../../../../shared/errors/app-error'
import { ProductStockUpdatedEvent } from '../../domain/events/product-stock-updated.event'
import { ProductRepository } from '../../domain/repositories/product.repository'
import { Product } from '../../domain/entities/product.entity'

interface UpdateProductInput {
  id: string
  name?: string
  description?: string
  price?: number
  stock?: number
  categoryId?: string
}

interface UpdateProductOutput {
  product: ReturnType<Product['toJSON']>
}

export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute({
    id,
    ...fields
  }: UpdateProductInput): Promise<UpdateProductOutput> {
    const existing = await this.productRepository.findById(id)

    if (!existing) {
      throw new NotFoundError('Product not found')
    }

    const stockChanged =
      fields.stock !== undefined && fields.stock !== existing.stock

    const updated = existing.update(fields)

    await this.productRepository.update(updated)

    if (stockChanged) {
      await this.eventBus.publish(
        new ProductStockUpdatedEvent({
          productId: updated.id,
          stock: updated.stock,
        }),
      )
    }

    return { product: updated.toJSON() }
  }
}
