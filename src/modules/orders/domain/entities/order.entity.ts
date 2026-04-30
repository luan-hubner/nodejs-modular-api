import { randomUUID } from 'crypto'
import { OrderItem } from './order-item.entity'
import { ValidationError, ForbiddenError } from '../../../../shared/errors'

export type OrderStatus = 'PENDING' | 'CANCELLED' | 'COMPLETED'

interface OrderProps {
  id: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

interface CreateOrderDTO {
  userId: string
  items: OrderItem[]
}

export class Order {
  public readonly id: string
  public readonly userId: string
  public readonly status: OrderStatus
  public readonly items: OrderItem[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: OrderProps) {
    this.id = props.id
    this.userId = props.userId
    this.status = props.status
    this.items = props.items
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(dto: CreateOrderDTO): Order {
    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new ValidationError('Order userId is required')
    }
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationError('Order must have at least one item')
    }
    const now = new Date()
    return new Order({
      id: randomUUID(),
      userId: dto.userId,
      status: 'PENDING',
      items: dto.items,
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: OrderProps): Order {
    return new Order(props)
  }

  cancel(): Order {
    if (this.status !== 'PENDING') {
      throw new ForbiddenError('Only PENDING orders can be cancelled')
    }
    const now = new Date()
    return Order.restore({ ...this, status: 'CANCELLED', updatedAt: now })
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0)
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      status: this.status,
      items: this.items.map((i) => i.toJSON()),
      total: this.total,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
