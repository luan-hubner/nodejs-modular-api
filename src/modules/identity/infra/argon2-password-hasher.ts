import argon2 from 'argon2'
import type { PasswordHasher } from '../domain/password-hasher'

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return argon2.hash(plain)
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return argon2.verify(hashed, plain)
  }
}
