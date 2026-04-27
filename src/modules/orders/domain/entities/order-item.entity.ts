import { randomUUID } from 'crypto'

interface OrderItemProps {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
}

interface CreateOrderItemDTO {
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
}

export class OrderItem {
  public readonly id: string
  public readonly orderId: string
  public readonly productId: string
  public readonly quantity: number
  public readonly unitPrice: number

  private constructor(props: OrderItemProps) {
    this.id = props.id
    this.orderId = props.orderId
    this.productId = props.productId
    this.quantity = props.quantity
    this.unitPrice = props.unitPrice
  }

  static create(dto: CreateOrderItemDTO): OrderItem {
    return new OrderItem({ id: randomUUID(), ...dto })
  }

  static restore(props: OrderItemProps): OrderItem {
    return new OrderItem(props)
  }

  get total(): number {
    return this.quantity * this.unitPrice
  }

  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      total: this.total,
    }
  }
}
