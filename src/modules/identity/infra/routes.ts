import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../../shared/event-bus'
import { IdentityController } from './identity.controller'
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case'
import { GetMeUseCase } from '../application/use-cases/get-me.use-case'
import { LoginUseCase } from '../application/use-cases/login.use-case'
import { PrismaUserRepository } from './prisma-user.repository'
import { Argon2PasswordHasher } from './argon2-password-hasher'
import { validateBody } from '../../../shared/middleware/validate'
import { registerBodySchema, loginBodySchema } from './identity.schemas'

export async function identityRoutes(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  const userRepository = new PrismaUserRepository()
  const passwordHasher = new Argon2PasswordHasher()
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    options.eventBus,
    passwordHasher,
  )
  const getMeUseCase = new GetMeUseCase(userRepository)
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher)
  const controller = new IdentityController(
    registerUserUseCase,
    getMeUseCase,
    loginUseCase,
  )

  fastify.post<{ Body: { name: string; email: string; password: string } }>(
    '/register',
    { preHandler: [validateBody(registerBodySchema)] },
    (request, reply) => controller.register(request, reply),
  )

  fastify.post<{ Body: { email: string; password: string } }>(
    '/login',
    { preHandler: [validateBody(loginBodySchema)] },
    (request, reply) => controller.signIn(request, reply),
  )

  fastify.get('/me', { preHandler: [fastify.authenticate] }, (request, reply) =>
    controller.me(request, reply),
  )
}
