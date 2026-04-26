import { Category } from '../../domain/entities/category.entity'
import { CategoryRepository } from '../../domain/repositories/category.repository'

interface ListCategoriesOutput {
  categories: ReturnType<Category['toJSON']>[]
}

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<ListCategoriesOutput> {
    const categories = await this.categoryRepository.findAll()

    return { categories: categories.map((c) => c.toJSON()) }
  }
}
