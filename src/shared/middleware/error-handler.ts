import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/app-error'

export function errorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  // Erro de domínio / aplicação (lançado intencionalmente)
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code ?? error.name,
        message: error.message,
      },
    })
  }

  // Erro de validação do Fastify (ex: schema inválido)
  if ('statusCode' in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    })
  }

  // Erro de autenticação JWT do @fastify/jwt
  if ('statusCode' in error && error.statusCode === 401) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      },
    })
  }

  // Erro genérico — não vaza detalhes em produção
  console.error('[Unhandled Error]', error)

  return reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}
