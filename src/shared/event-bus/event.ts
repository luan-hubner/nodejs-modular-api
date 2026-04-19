export interface DomainEvent {
  readonly eventName: string
  readonly occurredAt: Date
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredAt: Date

  constructor(public readonly eventName: string) {
    this.occurredAt = new Date()
  }
}
