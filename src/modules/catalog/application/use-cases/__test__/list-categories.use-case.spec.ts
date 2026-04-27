import { ListCategoriesUseCase } from '../list-categories.use-case'
import { Category } from '../../../domain/entities/category.entity'
import { CategoryRepository } from '../../../domain/repositories/category.repository'

class InMemoryCategoryRepository implements CategoryRepository {
  public categories: Category[] = []

  async findById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) ?? null
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categories.find((c) => c.name === name) ?? null
  }

  async findAll(): Promise<Category[]> {
    return [...this.categories]
  }

  async save(category: Category): Promise<void> {
    this.categories.push(category)
  }
}

describe('ListCategoriesUseCase', () => {
  let repository: InMemoryCategoryRepository
  let sut: ListCategoriesUseCase

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository()
    sut = new ListCategoriesUseCase(repository)

    await repository.save(Category.create({ name: 'Electronics' }))
    await repository.save(Category.create({ name: 'Books' }))
  })

  it('should return all categories', async () => {
    const { categories } = await sut.execute()

    expect(categories).toHaveLength(2)
  })

  it('should return an empty list when there are no categories', async () => {
    repository.categories = []

    const { categories } = await sut.execute()

    expect(categories).toHaveLength(0)
  })

  it('should return categories with correct fields', async () => {
    const { categories } = await sut.execute()

    for (const category of categories) {
      expect(category).toHaveProperty('id')
      expect(category).toHaveProperty('name')
      expect(category).toHaveProperty('createdAt')
    }
  })
})
