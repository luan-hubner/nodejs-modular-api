import { User } from '../../domain/entities/user.entity'
import { UserRepository } from '../../domain/repositories/user.repository'
import { NotFoundError } from '../../../../shared/errors/app-error'

interface GetMeOutput {
  user: ReturnType<User['toJSON']>
}

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<GetMeOutput> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return { user: user.toJSON() }
  }
}
