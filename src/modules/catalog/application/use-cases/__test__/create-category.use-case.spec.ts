import { CreateCategoryUseCase } from '../create-category.use-case'
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

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository
  let sut: CreateCategoryUseCase

  beforeEach(() => {
    repository = new InMemoryCategoryRepository()
    sut = new CreateCategoryUseCase(repository)
  })

  it('should create a category with valid name', async () => {
    const { category } = await sut.execute({ name: 'Electronics' })

    expect(category.id).toBeDefined()
    expect(category.name).toBe('Electronics')
    expect(category.createdAt).toBeInstanceOf(Date)
  })

  it('should persist the category in the repository', async () => {
    await sut.execute({ name: 'Electronics' })

    const saved = await repository.findByName('Electronics')
    expect(saved).not.toBeNull()
  })

  it('should throw if a category with the same name already exists', async () => {
    await sut.execute({ name: 'Electronics' })

    await expect(sut.execute({ name: 'Electronics' })).rejects.toThrow(
      'Category already exists',
    )
  })

  it('should not expose internal entity, returning only toJSON fields', async () => {
    const { category } = await sut.execute({ name: 'Books' })

    expect(category).toHaveProperty('id')
    expect(category).toHaveProperty('name')
    expect(category).toHaveProperty('createdAt')
  })
})
