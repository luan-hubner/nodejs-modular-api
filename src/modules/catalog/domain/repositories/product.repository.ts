import { Product } from '../entities/product.entity'

export interface ProductRepository {
  findById(id: string): Promise<Product | null>
  findAll(filters?: { categoryId?: string }): Promise<Product[]>
  save(product: Product): Promise<void>
  update(product: Product): Promise<void>
  delete(id: string): Promise<void>
}
