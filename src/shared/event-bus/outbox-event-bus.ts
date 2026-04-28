import { Prisma } from '../../../generated/prisma/client'
import { prisma } from '../lib/prisma'
import type { DomainEvent } from './event'
import type { EventHandler, IEventBus } from './event-bus.interface'
import { InMemoryEventBus } from './in-memory-event-bus'

export class OutboxEventBus implements IEventBus {
  constructor(private readonly inMemoryBus: InMemoryEventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    await prisma.outbox_event.create({
      data: {
        eventName: event.eventName,
        payload: event as unknown as Prisma.InputJsonValue,
        occurredAt: event.occurredAt,
      },
    })
  }

  subscribe(eventName: string, handler: EventHandler): void {
    this.inMemoryBus.subscribe(eventName, handler)
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    this.inMemoryBus.unsubscribe(eventName, handler)
  }
}
