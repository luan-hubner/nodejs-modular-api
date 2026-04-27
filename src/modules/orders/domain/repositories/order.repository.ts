import { Order } from '../entities/order.entity'

export interface OrderRepository {
  findById(id: string): Promise<Order | null>
  findByUserId(userId: string): Promise<Order[]>
  findActivByUserId(userId: string): Promise<Order[]>
  save(order: Order): Promise<void>
  update(order: Order): Promise<void>
}
