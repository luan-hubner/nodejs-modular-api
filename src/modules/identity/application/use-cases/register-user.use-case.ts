import type { IEventBus } from '../../../../shared/event-bus'
import { ConflictError } from '../../../../shared/errors/app-error'
import { User } from '../../domain/entities/user.entity'
import { UserRegisteredEvent } from '../../domain/events/user-registered.event'
import { UserRepository } from '../../domain/repositories/user.repository'
import type { PasswordHasher } from '../../domain/password-hasher'

interface RegisterUserInput {
  name: string
  email: string
  password: string
}

interface RegisterUserOutput {
  user: ReturnType<User['toJSON']>
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: IEventBus,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(email)

    if (existingUser) {
      throw new ConflictError('Email already in use')
    }

    const user = User.create({
      name,
      email,
      password: await this.passwordHasher.hash(password),
    })

    await this.userRepository.save(user)

    await this.eventBus.publish(
      new UserRegisteredEvent({
        userId: user.id,
        email: user.email,
        name: user.name,
      }),
    )

    return { user: user.toJSON() }
  }
}
