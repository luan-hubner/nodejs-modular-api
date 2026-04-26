import { randomUUID } from 'crypto'

interface CategoryProps {
  id: string
  name: string
  createdAt: Date
}

interface CreateCategoryDTO {
  name: string
}

export class Category {
  public readonly id: string
  public readonly name: string
  public readonly createdAt: Date

  private constructor(props: CategoryProps) {
    this.id = props.id
    this.name = props.name
    this.createdAt = props.createdAt
  }

  static create({ name }: CreateCategoryDTO): Category {
    return new Category({
      id: randomUUID(),
      name: name.trim(),
      createdAt: new Date(),
    })
  }

  static restore(props: CategoryProps): Category {
    return new Category(props)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    }
  }
}
