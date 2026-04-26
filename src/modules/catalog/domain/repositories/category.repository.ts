import { Category } from '../entities/category.entity'

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>
  findByName(name: string): Promise<Category | null>
  findAll(): Promise<Category[]>
  save(category: Category): Promise<void>
}
