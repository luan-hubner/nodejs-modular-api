import { User } from '../entities/user.entity'

const makeUser = (overrides = {}) =>
  User.create({
    email: 'john@example.com',
    password: 'hashed_password',
    name: 'John Doe',
    ...overrides,
  })

describe('User entity', () => {
  describe('create()', () => {
    it('should create a user with valid props', () => {
      const user = makeUser()

      expect(user.id).toBeDefined()
      expect(user.email).toBe('john@example.com')
      expect(user.name).toBe('John Doe')
      expect(user.password).toBe('hashed_password')
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('should normalize email to lowercase', () => {
      const user = makeUser({ email: 'JOHN@EXAMPLE.COM' })

      expect(user.email).toBe('john@example.com')
    })

    it('should trim whitespace from name', () => {
      const user = makeUser({ name: '  John Doe  ' })

      expect(user.name).toBe('John Doe')
    })

    it('should generate a unique id for each user', () => {
      const user1 = makeUser()
      const user2 = makeUser()

      expect(user1.id).not.toBe(user2.id)
    })
  })

  describe('restore()', () => {
    it('should restore a user with exact props', () => {
      const props = {
        id: 'fixed-id-123',
        email: 'restored@example.com',
        password: 'some_hash',
        name: 'Restored User',
        createdAt: new Date('2024-01-01'),
      }

      const user = User.restore(props)

      expect(user.id).toBe(props.id)
      expect(user.email).toBe(props.email)
      expect(user.name).toBe(props.name)
      expect(user.password).toBe(props.password)
      expect(user.createdAt).toBe(props.createdAt)
    })
  })

  describe('toJSON()', () => {
    it('should return public fields without password', () => {
      const user = makeUser()
      const json = user.toJSON()

      expect(json).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      })

      expect(json).not.toHaveProperty('password')
    })
  })
})
