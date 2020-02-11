export interface Store<T> {
  store(t: T): Promise<T | undefined>

  findAll(): Promise<T[] | undefined>
}