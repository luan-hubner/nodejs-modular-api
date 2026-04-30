import { prisma } from '../../../shared/lib/prisma'
import { Order, OrderStatus } from '../domain/entities/order.entity'
import { OrderItem } from '../domain/entities/order-item.entity'
import { OrderRepository } from '../domain/repositories/order.repository'
import { ITransactionalOrderRepository } from '../domain/repositories/transactional-order.repository'
import { AppError } from '../../../shared/errors'

type OrderRow = {
  id: string
  userId: string
  status: string
  createdAt: Date
  updatedAt: Date
  items: {
    id: string
    orderId: string
    productId: string
    quantity: number
    unitPrice: { toNumber(): number }
  }[]
}

function toEntity(row: OrderRow): Order {
  const items = row.items.map((item) =>
    OrderItem.restore({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
    }),
  )
  return Order.restore({
    id: row.id,
    userId: row.userId,
    status: row.status as OrderStatus,
    items,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaOrderRepository implements ITransactionalOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return null
    return toEntity(row)
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toEntity)
  }

  async findActivByUserId(userId: string): Promise<Order[]> {
    const rows = await prisma.order.findMany({
      where: { userId, status: 'PENDING' },
      include: { items: true },
    })
    return rows.map(toEntity)
  }

  async save(order: Order): Promise<void> {
    await prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    })
  }

  async update(order: Order): Promise<void> {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        updatedAt: order.updatedAt,
      },
    })
  }

  async saveWithStockDecrement(
    order: Order,
    stockDecrements: { productId: string; quantity: number; name: string }[],
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Atomically decrement stock for each item.
      // Using updateMany with a `stock >= quantity` guard ensures that if a
      // concurrent request already consumed the stock, the count will be 0 and
      // we throw before any partial mutation is committed.
      for (const decrement of stockDecrements) {
        const result = await tx.catalog_product.updateMany({
          where: {
            id: decrement.productId,
            stock: { gte: decrement.quantity },
          },
          data: { stock: { decrement: decrement.quantity } },
        })

        if (result.count === 0) {
          throw new AppError(
            `Insufficient stock for product "${decrement.name}"`,
            409,
            'INSUFFICIENT_STOCK',
          )
        }
      }

      // Create the order and its items inside the same transaction.
      await tx.order.create({
        data: {
          id: order.id,
          userId: order.userId,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          items: {
            create: order.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      })
    })
  }
}
