import { FastifyInstance } from 'fastify'
import { IdentityController } from './identity.controller'
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case'
import { PrismaUserRepository } from './prisma-user.repository'

export async function identityRoutes(fastify: FastifyInstance) {
  const userRepository = new PrismaUserRepository()
  const registerUserUseCase = new RegisterUserUseCase(userRepository)
  const controller = new IdentityController(registerUserUseCase)

  fastify.post<{ Body: { name: string; email: string; password: string } }>(
    '/register',
    (request, reply) => controller.register(request, reply),
  )
}
