import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../../shared/event-bus'
import { IdentityController } from './identity.controller'
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case'
import { PrismaUserRepository } from './prisma-user.repository'
import { Argon2PasswordHasher } from './argon2-password-hasher'

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
  const controller = new IdentityController(registerUserUseCase)

  fastify.post<{ Body: { name: string; email: string; password: string } }>(
    '/register',
    (request, reply) => controller.register(request, reply),
  )
}
