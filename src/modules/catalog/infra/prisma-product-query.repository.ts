import { prisma } from '../../../shared/lib/prisma'
import type {
  IProductQueryRepository,
  ProductQueryData,
} from '../domain/repositories/product-query.repository'

export class PrismaProductQueryRepository implements IProductQueryRepository {
  async findManyByIds(ids: string[]): Promise<ProductQueryData[]> {
    const rows = await prisma.catalog_product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, price: true, stock: true },
    })

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: row.price.toNumber(),
      stock: row.stock,
    }))
  }
}
