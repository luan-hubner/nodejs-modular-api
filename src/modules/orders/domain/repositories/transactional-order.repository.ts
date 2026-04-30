import { Order } from '../entities/order.entity'
import { OrderRepository } from './order.repository'

export interface ITransactionalOrderRepository extends OrderRepository {
  /**
   * Atomically decrements stock for each item and persists the order.
   * Throws AppError (INSUFFICIENT_STOCK / 409) if any product lacks stock.
   */
  saveWithStockDecrement(
    order: Order,
    stockDecrements: { productId: string; quantity: number; name: string }[],
  ): Promise<void>
}
