import { User } from '../../domain/entities/user.entity'
import { UserRepository } from '../../domain/repositories/user.repository'

interface RegisterUserInput {
  name: string
  email: string
  password: string
}

interface RegisterUserOutput {
  user: ReturnType<User['toJSON']>
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new Error('Email already in use')
    }

    const user = User.create({ name, email, password })

    await this.userRepository.save(user)

    return { user: user.toJSON() }
  }
}
