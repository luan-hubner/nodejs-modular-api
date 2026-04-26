import { prisma } from '../../../shared/lib/prisma'
import { Product } from '../domain/entities/product.entity'
import { ProductRepository } from '../domain/repositories/product.repository'

function toEntity(row: {
  id: string
  name: string
  description: string | null
  price: { toNumber(): number }
  stock: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}): Product {
  return Product.restore({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price.toNumber(),
    stock: row.stock,
    categoryId: row.categoryId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const row = await prisma.catalog_product.findUnique({ where: { id } })
    if (!row) return null
    return toEntity(row)
  }

  async findAll(filters?: { categoryId?: string }): Promise<Product[]> {
    const rows = await prisma.catalog_product.findMany({
      where: filters?.categoryId
        ? { categoryId: filters.categoryId }
        : undefined,
      orderBy: { name: 'asc' },
    })
    return rows.map(toEntity)
  }

  async save(product: Product): Promise<void> {
    await prisma.catalog_product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    })
  }

  async update(product: Product): Promise<void> {
    await prisma.catalog_product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        updatedAt: product.updatedAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.catalog_product.delete({ where: { id } })
  }
}
