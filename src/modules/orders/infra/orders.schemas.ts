import { z } from 'zod'

export const placeOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z
          .number()
          .int()
          .positive('Quantity must be a positive integer'),
      }),
    )
    .min(1, 'Order must have at least one item'),
})

export const orderParamsSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export type PlaceOrderBody = z.infer<typeof placeOrderBodySchema>
export type OrderParams = z.infer<typeof orderParamsSchema>
