import { LoginUseCase } from '../login.use-case'
import { User } from '../../../domain/entities/user.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'
import { PasswordHasher } from '../../../domain/password-hasher'

class InMemoryUserRepository implements UserRepository {
  public users: User[] = []

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null
  }

  async save(user: User): Promise<void> {
    this.users.push(user)
  }
}

class FakePasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed:${password}`
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed:${password}`
  }
}

describe('LoginUseCase', () => {
  let repository: InMemoryUserRepository
  let passwordHasher: FakePasswordHasher
  let sut: LoginUseCase

  beforeEach(async () => {
    repository = new InMemoryUserRepository()
    passwordHasher = new FakePasswordHasher()
    sut = new LoginUseCase(repository, passwordHasher)

    const user = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: await passwordHasher.hash('secret123'),
    })
    await repository.save(user)
  })

  it('should return userId on valid credentials', async () => {
    const { userId } = await sut.execute({
      email: 'john@example.com',
      password: 'secret123',
    })

    expect(userId).toBeDefined()
    expect(typeof userId).toBe('string')
  })

  it('should throw if email does not exist', async () => {
    await expect(
      sut.execute({
        email: 'unknown@example.com',
        password: 'secret123',
      }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('should throw if password is wrong', async () => {
    await expect(
      sut.execute({
        email: 'john@example.com',
        password: 'wrong_password',
      }),
    ).rejects.toThrow('Invalid credentials')
  })

  it('should return the correct userId for the authenticated user', async () => {
    const savedUser = await repository.findByEmail('john@example.com')
    const { userId } = await sut.execute({
      email: 'john@example.com',
      password: 'secret123',
    })

    expect(userId).toBe(savedUser!.id)
  })
})
