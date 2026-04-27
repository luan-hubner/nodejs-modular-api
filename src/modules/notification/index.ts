import type { IEventBus } from '../../shared/event-bus'
import { UserRegisteredEvent } from '../identity/domain/events/user-registered.event'
import { OrderPlacedEvent } from '../orders/domain/events/order-placed.event'
import { OrderCancelledEvent } from '../orders/domain/events/order-cancelled.event'
import { SendWelcomeEmailHandler } from './application/send-welcome-email.handler'
import { OrderPlacedNotificationHandler } from './application/order-placed-notification.handler'
import { OrderCancelledNotificationHandler } from './application/order-cancelled-notification.handler'
import { FakeEmailService } from './infra/fake-email.service'

export function notificationModule(eventBus: IEventBus): void {
  const emailService = new FakeEmailService()
  const sendWelcomeEmailHandler = new SendWelcomeEmailHandler(emailService)
  const orderPlacedHandler = new OrderPlacedNotificationHandler()
  const orderCancelledHandler = new OrderCancelledNotificationHandler()

  eventBus.subscribe(
    UserRegisteredEvent.EVENT_NAME,
    sendWelcomeEmailHandler.handle.bind(sendWelcomeEmailHandler),
  )

  eventBus.subscribe(
    OrderPlacedEvent.EVENT_NAME,
    orderPlacedHandler.handle.bind(orderPlacedHandler),
  )

  eventBus.subscribe(
    OrderCancelledEvent.EVENT_NAME,
    orderCancelledHandler.handle.bind(orderCancelledHandler),
  )
}
