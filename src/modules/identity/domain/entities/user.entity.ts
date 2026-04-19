import { randomUUID } from 'crypto'

interface UserProps {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

interface CreateUserDTO {
  email: string
  password: string
  name: string
}

export class User {
  public readonly id: string
  public readonly email: string
  public readonly password: string
  public readonly name: string
  public readonly createdAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.password = props.password
    this.name = props.name
    this.createdAt = props.createdAt
  }

  static create({ email, password, name }: CreateUserDTO): User {
    return new User({
      id: randomUUID(),
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      createdAt: new Date(),
    })
  }

  static restore(props: UserProps): User {
    return new User(props)
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
    }
  }
}
