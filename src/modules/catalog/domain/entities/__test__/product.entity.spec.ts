import { Product } from '../product.entity'
import { ValidationError } from '../../../../../shared/errors'

const makeProduct = (overrides = {}) =>
  Product.create({
    name: 'Test Product',
    price: 10.0,
    stock: 5,
    categoryId: 'cat-1',
    ...overrides,
  })

describe('Product entity', () => {
  describe('create()', () => {
    it('should create a product with valid props', () => {
      const product = makeProduct()

      expect(product.id).toBeDefined()
      expect(product.name).toBe('Test Product')
      expect(product.price).toBe(10.0)
      expect(product.stock).toBe(5)
      expect(product.categoryId).toBe('cat-1')
      expect(product.createdAt).toBeInstanceOf(Date)
      expect(product.updatedAt).toBeInstanceOf(Date)
    })

    it('should trim whitespace from name', () => {
      const product = makeProduct({ name: '  My Product  ' })
      expect(product.name).toBe('My Product')
    })

    it('should default stock to 0 when not provided', () => {
      const product = makeProduct({ stock: undefined })
      expect(product.stock).toBe(0)
    })

    it('should throw ValidationError if name is empty', () => {
      expect(() => makeProduct({ name: '' })).toThrow(ValidationError)
      expect(() => makeProduct({ name: '   ' })).toThrow(ValidationError)
    })

    it('should throw ValidationError if price is zero', () => {
      expect(() => makeProduct({ price: 0 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if price is negative', () => {
      expect(() => makeProduct({ price: -1 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if stock is negative', () => {
      expect(() => makeProduct({ stock: -1 })).toThrow(ValidationError)
    })

    it('should throw ValidationError if categoryId is empty', () => {
      expect(() => makeProduct({ categoryId: '' })).toThrow(ValidationError)
    })
  })

  describe('restore()', () => {
    it('should restore a product with exact props', () => {
      const props = {
        id: 'prod-123',
        name: 'Restored',
        description: null,
        price: 5.0,
        stock: 10,
        categoryId: 'cat-99',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      const product = Product.restore(props)

      expect(product.id).toBe(props.id)
      expect(product.name).toBe(props.name)
      expect(product.stock).toBe(props.stock)
    })
  })
})
