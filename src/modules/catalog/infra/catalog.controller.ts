import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateCategoryUseCase } from '../application/use-cases/create-category.use-case'
import { ListCategoriesUseCase } from '../application/use-cases/list-categories.use-case'
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case'
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case'
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case'
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case'

export class CatalogController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
    private readonly listProducts: ListProductsUseCase,
  ) {}

  async handleCreateCategory(
    request: FastifyRequest<{ Body: { name: string } }>,
    reply: FastifyReply,
  ) {
    const { name } = request.body
    const { category } = await this.createCategory.execute({ name })
    return reply.status(201).send({ category })
  }

  async handleListCategories(_request: FastifyRequest, reply: FastifyReply) {
    const { categories } = await this.listCategories.execute()
    return reply.send({ categories })
  }

  async handleCreateProduct(
    request: FastifyRequest<{
      Body: {
        name: string
        description?: string
        price: number
        stock?: number
        categoryId: string
      }
    }>,
    reply: FastifyReply,
  ) {
    const { product } = await this.createProduct.execute(request.body)
    return reply.status(201).send({ product })
  }

  async handleUpdateProduct(
    request: FastifyRequest<{
      Params: { id: string }
      Body: {
        name?: string
        description?: string
        price?: number
        stock?: number
        categoryId?: string
      }
    }>,
    reply: FastifyReply,
  ) {
    const { product } = await this.updateProduct.execute({
      id: request.params.id,
      ...request.body,
    })
    return reply.send({ product })
  }

  async handleDeleteProduct(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await this.deleteProduct.execute(request.params.id)
    return reply.status(204).send()
  }

  async handleListProducts(
    request: FastifyRequest<{ Querystring: { categoryId?: string } }>,
    reply: FastifyReply,
  ) {
    const { products } = await this.listProducts.execute({
      categoryId: request.query.categoryId,
    })
    return reply.send({ products })
  }
}
