import { BaseDomainEvent } from '../../../../shared/event-bus'

interface UserRegisteredEventPayload {
  userId: string
  email: string
  name: string
}

export class UserRegisteredEvent extends BaseDomainEvent {
  static readonly EVENT_NAME = 'user.registered'

  constructor(public readonly payload: UserRegisteredEventPayload) {
    super(UserRegisteredEvent.EVENT_NAME)
  }
}
