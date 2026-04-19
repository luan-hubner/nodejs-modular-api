import type { DomainEvent } from './event'
import type { EventHandler, IEventBus } from './event-bus.interface'

export class InMemoryEventBus implements IEventBus {
  private readonly handlers = new Map<string, EventHandler[]>()

  async publish(event: DomainEvent): Promise<void> {
    const eventHandlers = this.handlers.get(event.eventName) ?? []
    await Promise.all(eventHandlers.map((handler) => handler(event)))
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? []
    this.handlers.set(eventName, [...existing, handler])
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? []
    this.handlers.set(
      eventName,
      existing.filter((h) => h !== handler),
    )
  }

  clear(): void {
    this.handlers.clear()
  }
}
