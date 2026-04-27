import { UserRepository } from '../../domain/repositories/user.repository'
import type { PasswordHasher } from '../../domain/password-hasher'
import { UnauthorizedError } from '../../../../shared/errors/app-error'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  userId: string
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const isValid = await this.passwordHasher.verify(password, user.password)

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    return { userId: user.id }
  }
}
