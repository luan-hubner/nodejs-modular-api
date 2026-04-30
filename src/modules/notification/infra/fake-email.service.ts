import type { EmailService } from '../domain/email.service'
import { createLogger } from '../../../shared/lib/create-logger'

const logger = createLogger('FakeEmailService')

export class FakeEmailService implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    logger.debug({ to, subject, body }, 'Email sent (fake)')
  }
}
