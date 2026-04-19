import { prisma } from '../../../shared/lib/prisma'
import { User } from '../domain/entities/user.entity'
import { UserRepository } from '../domain/repositories/user.repository'

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } })

    if (!row) return null

    return User.restore({
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      createdAt: row.createdAt,
    })
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        createdAt: user.createdAt,
      },
    })
  }
}
