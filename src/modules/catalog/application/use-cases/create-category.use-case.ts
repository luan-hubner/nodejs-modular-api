import { Category } from '../../domain/entities/category.entity'
import { CategoryRepository } from '../../domain/repositories/category.repository'
import { ConflictError } from '../../../../shared/errors/app-error'

interface CreateCategoryInput {
  name: string
}

interface CreateCategoryOutput {
  category: ReturnType<Category['toJSON']>
}

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({ name }: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const existing = await this.categoryRepository.findByName(name)

    if (existing) {
      throw new ConflictError('Category already exists')
    }

    const category = Category.create({ name })

    await this.categoryRepository.save(category)

    return { category: category.toJSON() }
  }
}
