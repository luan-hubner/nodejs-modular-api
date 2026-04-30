export interface ProductQueryData {
  id: string
  name: string
  price: number
  stock: number
}

export interface IProductQueryRepository {
  findManyByIds(ids: string[]): Promise<ProductQueryData[]>
}
