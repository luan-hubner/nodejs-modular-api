import { prisma } from '../../../shared/lib/prisma'
import { Category } from '../domain/entities/category.entity'
import { CategoryRepository } from '../domain/repositories/category.repository'

export class PrismaCategoryRepository implements CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const row = await prisma.catalog_category.findUnique({ where: { id } })
    if (!row) return null
    return Category.restore({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    })
  }

  async findByName(name: string): Promise<Category | null> {
    const row = await prisma.catalog_category.findUnique({ where: { name } })
    if (!row) return null
    return Category.restore({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    })
  }

  async findAll(): Promise<Category[]> {
    const rows = await prisma.catalog_category.findMany({
      orderBy: { name: 'asc' },
    })
    return rows.map((row) =>
      Category.restore({
        id: row.id,
        name: row.name,
        createdAt: row.createdAt,
      }),
    )
  }

  async save(category: Category): Promise<void> {
    await prisma.catalog_category.create({
      data: {
        id: category.id,
        name: category.name,
        createdAt: category.createdAt,
      },
    })
  }
}
