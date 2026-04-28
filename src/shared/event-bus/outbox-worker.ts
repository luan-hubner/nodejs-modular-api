import { prisma } from '../lib/prisma'
import type { DomainEvent } from './event'
import { InMemoryEventBus } from './in-memory-event-bus'

export class OutboxWorker {
  private timer: NodeJS.Timeout | null = null

  constructor(
    private readonly inMemoryBus: InMemoryEventBus,
    private readonly intervalMs = 5000,
    private readonly batchSize = 10,
    private readonly maxAttempts = 3,
  ) {}

  start(): void {
    this.timer = setInterval(() => void this.process(), this.intervalMs)
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer)
  }

  private async process(): Promise<void> {
    const events = await prisma.outbox_event.findMany({
      where: {
        processedAt: null,
        attempts: { lt: this.maxAttempts },
      },
      orderBy: { occurredAt: 'asc' },
      take: this.batchSize,
    })

    /**
     * A Broker like Redis or RabbitMQ would be ideal for this to avoid duplicate events
     * and ensure delivery.
     *
     * But for simplicity and study purposes I'm using a polling mechanism.
     */

    for (const row of events) {
      try {
        await prisma.outbox_event.update({
          where: { id: row.id },
          data: { processedAt: new Date() },
        })

        await this.inMemoryBus.publish(row.payload as unknown as DomainEvent)
      } catch (err) {
        await prisma.outbox_event.update({
          where: { id: row.id },
          data: {
            processedAt: null,
            attempts: { increment: 1 },
            lastError: (err as Error).message,
          },
        })
      }
    }
  }
}
