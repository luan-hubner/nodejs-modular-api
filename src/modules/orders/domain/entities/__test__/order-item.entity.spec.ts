import { OrderItem } from '../order-item.entity'
import { ValidationError } from '../../../../../shared/errors'

const makeOrderItem = (overrides = {}) =>
  OrderItem.create({
    orderId: 'order-1',
    productId: 'prod-1',
    quantity: 2,
    unitPrice: 10.0,
    ...overrides,
  })

describe('OrderItem entity', () => {
  describe('create()', () => {
    it('should create an order item with valid props', () => {
      const item = makeOrderItem()

      expect(item.id).toBeDefined()
      expect(item.orderId).toBe('order-1')
      expect(item.productId).toBe('prod-1')
      expect(item.quantity).toBe(2)
      expect(item.unitPrice).toBe(10.0)
    })

    it('should calculate total correctly', () => {
      const item = makeOrderItem({ quantity: 3, unitPrice: 5 })
      expect(item.total).toBe(15)
    })

    it('should throw ValidationError if quantity is zero', () => {
      expect(() => makeOrderItem({ quantity: 0 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if quantity is negative', () => {
      expect(() => makeOrderItem({ quantity: -1 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if unitPrice is zero', () => {
      expect(() => makeOrderItem({ unitPrice: 0 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if unitPrice is negative', () => {
      expect(() => makeOrderItem({ unitPrice: -5 })).toThrow(ValidationError)
    })
  })

  describe('restore()', () => {
    it('should restore an order item with exact props', () => {
      const props = {
        id: 'item-999',
        orderId: 'order-99',
        productId: 'prod-99',
        quantity: 1,
        unitPrice: 20,
      }
      const item = OrderItem.restore(props)
      expect(item.id).toBe(props.id)
      expect(item.total).toBe(20)
    })
  })
})
