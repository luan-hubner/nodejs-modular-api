import type { IEventBus } from '../../shared/event-bus'
import { UserRegisteredEvent } from '../identity/domain/events/user-registered.event'
import { SendWelcomeEmailHandler } from './application/send-welcome-email.handler'
import { FakeEmailService } from './infra/fake-email.service'

export function notificationModule(eventBus: IEventBus): void {
  const emailService = new FakeEmailService()
  const sendWelcomeEmailHandler = new SendWelcomeEmailHandler(emailService)

  eventBus.subscribe(
    UserRegisteredEvent.EVENT_NAME,
    sendWelcomeEmailHandler.handle.bind(sendWelcomeEmailHandler),
  )
}
