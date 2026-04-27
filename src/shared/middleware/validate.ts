import { FastifyRequest, FastifyReply } from 'fastify'
import { ZodSchema } from 'zod'

type ZodIssue = { path: (string | number)[]; message: string }

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation error',
        issues: formatZodError(result.error as { issues: ZodIssue[] }),
      })
    }
    request.body = result.data
  }
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const result = schema.safeParse(request.params)
    if (!result.success) {
      return reply.status(400).send({
        error: 'Validation error',
        issues: formatZodError(result.error as { issues: ZodIssue[] }),
      })
    }
    request.params = result.data as Record<string, unknown>
  }
}

function formatZodError(error: { issues: ZodIssue[] }) {
  return error.issues.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }))
}
