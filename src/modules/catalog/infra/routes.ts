import { FastifyInstance } from 'fastify'
import type { IEventBus } from '../../../shared/event-bus'
import { CatalogController } from './catalog.controller'
import { PrismaCategoryRepository } from './prisma-category.repository'
import { PrismaProductRepository } from './prisma-product.repository'
import { CreateCategoryUseCase } from '../application/use-cases/create-category.use-case'
import { ListCategoriesUseCase } from '../application/use-cases/list-categories.use-case'
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case'
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case'
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case'
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case'
import {
  validateBody,
  validateParams,
} from '../../../shared/middleware/validate'
import {
  createCategoryBodySchema,
  createProductBodySchema,
  updateProductBodySchema,
  productParamsSchema,
} from './catalog.schemas'

export async function catalogRoutes(
  fastify: FastifyInstance,
  options: { eventBus: IEventBus },
) {
  const categoryRepository = new PrismaCategoryRepository()
  const productRepository = new PrismaProductRepository()

  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository)
  const listCategoriesUseCase = new ListCategoriesUseCase(categoryRepository)
  const createProductUseCase = new CreateProductUseCase(
    productRepository,
    categoryRepository,
    options.eventBus,
  )
  const updateProductUseCase = new UpdateProductUseCase(
    productRepository,
    options.eventBus,
  )
  const deleteProductUseCase = new DeleteProductUseCase(productRepository)
  const listProductsUseCase = new ListProductsUseCase(productRepository)

  const controller = new CatalogController(
    createCategoryUseCase,
    listCategoriesUseCase,
    createProductUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    listProductsUseCase,
  )

  // Categories
  fastify.post<{ Body: { name: string } }>(
    '/categories',
    {
      preHandler: [
        fastify.authenticate,
        validateBody(createCategoryBodySchema),
      ],
    },
    (req, reply) => controller.handleCreateCategory(req, reply),
  )

  fastify.get('/categories', (req, reply) =>
    controller.handleListCategories(req, reply),
  )

  // Products
  fastify.post<{
    Body: {
      name: string
      description?: string
      price: number
      stock?: number
      categoryId: string
    }
  }>(
    '/products',
    {
      preHandler: [fastify.authenticate, validateBody(createProductBodySchema)],
    },
    (req, reply) => controller.handleCreateProduct(req, reply),
  )

  fastify.put<{
    Params: { id: string }
    Body: {
      name?: string
      description?: string
      price?: number
      stock?: number
      categoryId?: string
    }
  }>(
    '/products/:id',
    {
      preHandler: [
        fastify.authenticate,
        validateParams(productParamsSchema),
        validateBody(updateProductBodySchema),
      ],
    },
    (req, reply) => controller.handleUpdateProduct(req, reply),
  )

  fastify.delete<{ Params: { id: string } }>(
    '/products/:id',
    { preHandler: [fastify.authenticate, validateParams(productParamsSchema)] },
    (req, reply) => controller.handleDeleteProduct(req, reply),
  )

  fastify.get<{ Querystring: { categoryId?: string } }>(
    '/products',
    (req, reply) => controller.handleListProducts(req, reply),
  )
}
