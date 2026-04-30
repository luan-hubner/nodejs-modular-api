import { randomUUID } from 'crypto'
import { ValidationError } from '../../../../shared/errors'

interface ProductProps {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

interface CreateProductDTO {
  name: string
  description?: string
  price: number
  stock?: number
  categoryId: string
}

export class Product {
  public readonly id: string
  public readonly name: string
  public readonly description: string | null
  public readonly price: number
  public readonly stock: number
  public readonly categoryId: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: ProductProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.price = props.price
    this.stock = props.stock
    this.categoryId = props.categoryId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create({
    name,
    description,
    price,
    stock,
    categoryId,
  }: CreateProductDTO): Product {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Product name is required')
    }
    if (price <= 0) {
      throw new ValidationError('Product price must be greater than 0')
    }
    if (stock !== undefined && stock < 0) {
      throw new ValidationError('Product stock cannot be negative')
    }
    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Product categoryId is required')
    }
    const now = new Date()
    return new Product({
      id: randomUUID(),
      name: name.trim(),
      description: description?.trim() ?? null,
      price,
      stock: stock ?? 0,
      categoryId,
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: ProductProps): Product {
    return new Product(props)
  }

  update(
    fields: Partial<
      Pick<
        ProductProps,
        'name' | 'description' | 'price' | 'stock' | 'categoryId'
      >
    >,
  ): Product {
    return new Product({
      id: this.id,
      name: fields.name ?? this.name,
      description:
        fields.description !== undefined
          ? fields.description
          : this.description,
      price: fields.price ?? this.price,
      stock: fields.stock ?? this.stock,
      categoryId: fields.categoryId ?? this.categoryId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      stock: this.stock,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
