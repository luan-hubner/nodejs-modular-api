import { Order } from '../order.entity'
import { OrderItem } from '../order-item.entity'
import { ValidationError, ForbiddenError } from '../../../../../shared/errors'

const makeItem = (overrides = {}) =>
  OrderItem.create({
    orderId: '',
    productId: 'prod-1',
    quantity: 1,
    unitPrice: 20,
    ...overrides,
  })

describe('Order entity', () => {
  describe('create()', () => {
    it('should create an order with valid props', () => {
      const item = makeItem()
      const order = Order.create({ userId: 'user-1', items: [item] })

      expect(order.id).toBeDefined()
      expect(order.userId).toBe('user-1')
      expect(order.status).toBe('PENDING')
      expect(order.items).toHaveLength(1)
      expect(order.createdAt).toBeInstanceOf(Date)
    })

    it('should throw ValidationError if userId is empty', () => {
      const item = makeItem()
      expect(() => Order.create({ userId: '', items: [item] })).toThrow(
        ValidationError,
      )
    })

    it('should throw ValidationError if items is empty', () => {
      expect(() => Order.create({ userId: 'user-1', items: [] })).toThrow(
        ValidationError,
      )
    })

    it('should calculate total correctly', () => {
      const item = makeItem({ quantity: 2, unitPrice: 15 })
      const order = Order.create({ userId: 'user-1', items: [item] })
      expect(order.total).toBe(30)
    })
  })

  describe('cancel()', () => {
    it('should cancel a PENDING order', () => {
      const item = makeItem()
      const order = Order.create({ userId: 'user-1', items: [item] })
      const cancelled = order.cancel()
      expect(cancelled.status).toBe('CANCELLED')
    })

    it('should throw ForbiddenError when cancelling a non-PENDING order', () => {
      const item = makeItem()
      const order = Order.restore({
        id: 'order-1',
        userId: 'user-1',
        status: 'CANCELLED',
        items: [item],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(() => order.cancel()).toThrow(ForbiddenError)
    })
  })

  describe('restore()', () => {
    it('should restore an order with exact props', () => {
      const item = makeItem()
      const props = {
        id: 'order-fixed',
        userId: 'user-99',
        status: 'COMPLETED' as const,
        items: [item],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }
      const order = Order.restore(props)
      expect(order.id).toBe(props.id)
      expect(order.status).toBe('COMPLETED')
    })
  })
})
