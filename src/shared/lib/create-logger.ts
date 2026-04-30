import { logger } from './logger'

export function createLogger(context: string) {
  return logger.child({ context })
}
