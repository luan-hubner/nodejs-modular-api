import { Order } from '../../domain/entities/order.entity'
import { OrderRepository } from '../../domain/repositories/order.repository'

interface GetOrderHistoryInput {
  userId: string
}

interface GetOrderHistoryOutput {
  orders: ReturnType<Order['toJSON']>[]
}

export class GetOrderHistoryUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: GetOrderHistoryInput): Promise<GetOrderHistoryOutput> {
    const orders = await this.orderRepository.findByUserId(input.userId)
    return { orders: orders.map((o) => o.toJSON()) }
  }
}
