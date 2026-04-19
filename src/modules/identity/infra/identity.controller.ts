import { FastifyReply, FastifyRequest } from 'fastify'
import { RegisterUserUseCase } from 'src/modules/identity/application/use-cases/register-user.use-case'

interface RegisterBody {
  name: string
  email: string
  password: string
}

export class IdentityController {
  constructor(private readonly registerUser: RegisterUserUseCase) {}

  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ) {
    const { name, email, password } = request.body

    const { user } = await this.registerUser.execute({ name, email, password })

    return reply.status(201).send({ user })
  }
}
