import { RegisterUserUseCase } from '../register-user.use-case'
import { User } from '../../../domain/entities/user.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'

class InMemoryUserRepository implements UserRepository {
  public users: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null
  }

  async save(user: User): Promise<void> {
    this.users.push(user)
  }
}

describe('RegisterUserUseCase', () => {
  let repository: InMemoryUserRepository
  let sut: RegisterUserUseCase

  beforeEach(() => {
    repository = new InMemoryUserRepository()
    sut = new RegisterUserUseCase(repository)
  })

  it('should register a new user', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('john@example.com')
    expect(user.name).toBe('John Doe')
    expect(repository.users).toHaveLength(1)
  })

  it('should persist user in the repository', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    })

    const saved = await repository.findByEmail('john@example.com')
    expect(saved).not.toBeNull()
  })

  it('should throw if email is already in use', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    })

    await expect(
      sut.execute({
        name: 'Another John',
        email: 'john@example.com',
        password: 'other_password',
      }),
    ).rejects.toThrow('Email already in use')
  })

  it('should not expose password in the output', async () => {
    const { user } = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    })

    expect(user).not.toHaveProperty('password')
  })
})
