import type { DomainEvent } from '../../../shared/event-bus'
import { UserRegisteredEvent } from '../../identity/domain/events/user-registered.event'
import type { EmailService } from '../domain/email.service'

export class SendWelcomeEmailHandler {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: DomainEvent): Promise<void> {
    const { payload } = event as UserRegisteredEvent
    const { email, name } = payload

    await this.emailService.send(
      email,
      'Welcome!',
      `Hi, ${name}! Your account has been successfully created.`,
    )
  }
}
