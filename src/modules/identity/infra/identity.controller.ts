import { FastifyReply, FastifyRequest } from 'fastify'
import { RegisterUserUseCase } from 'src/modules/identity/application/use-cases/register-user.use-case'
import { GetMeUseCase } from 'src/modules/identity/application/use-cases/get-me.use-case'
import { LoginUseCase } from 'src/modules/identity/application/use-cases/login.use-case'

interface RegisterBody {
  name: string
  email: string
  password: string
}

interface LoginBody {
  email: string
  password: string
}

export class IdentityController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly getMe: GetMeUseCase,
    private readonly login: LoginUseCase,
  ) {}

  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply,
  ) {
    const { name, email, password } = request.body

    const { user } = await this.registerUser.execute({ name, email, password })

    return reply.status(201).send({ user })
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const { sub } = request.user as { sub: string }

    const { user } = await this.getMe.execute(sub)

    return reply.send({ user })
  }

  async signIn(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
  ) {
    const { email, password } = request.body

    const { userId } = await this.login.execute({ email, password })

    const token = await reply.jwtSign({ sub: userId })

    return reply.send({ token })
  }
}
