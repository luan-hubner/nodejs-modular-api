import { GetMeUseCase } from '../get-me.use-case'
import { User } from '../../../domain/entities/user.entity'
import { UserRepository } from '../../../domain/repositories/user.repository'

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

describe('GetMeUseCase', () => {
  let repository: InMemoryUserRepository
  let sut: GetMeUseCase
  let savedUser: User

  beforeEach(async () => {
    repository = new InMemoryUserRepository()
    sut = new GetMeUseCase(repository)

    savedUser = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
    })
    await repository.save(savedUser)
  })

  it('should return the user data for a valid userId', async () => {
    const { user } = await sut.execute(savedUser.id)

    expect(user.id).toBe(savedUser.id)
    expect(user.email).toBe(savedUser.email)
    expect(user.name).toBe(savedUser.name)
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it('should not expose the password in the output', async () => {
    const { user } = await sut.execute(savedUser.id)

    expect(user).not.toHaveProperty('password')
  })

  it('should throw if user is not found', async () => {
    await expect(sut.execute('non-existent-id')).rejects.toThrow(
      'User not found',
    )
  })
})
