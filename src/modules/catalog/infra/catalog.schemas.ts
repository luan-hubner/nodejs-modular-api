import { z } from 'zod'

export const createCategoryBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const createProductBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  stock: z
    .number()
    .int()
    .nonnegative('Stock must be a non-negative integer')
    .optional(),
  categoryId: z.string().uuid('Invalid category ID'),
})

export const updateProductBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  stock: z
    .number()
    .int()
    .nonnegative('Stock must be a non-negative integer')
    .optional(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
})

export const productParamsSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
})

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>
export type CreateProductBody = z.infer<typeof createProductBodySchema>
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>
export type ProductParams = z.infer<typeof productParamsSchema>
