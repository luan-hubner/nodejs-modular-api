import type { DomainEvent } from './event'

export type EventHandler = (event: DomainEvent) => void | Promise<void>

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe(eventName: string, handler: EventHandler): void
  unsubscribe(eventName: string, handler: EventHandler): void
}
