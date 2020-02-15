export interface Store<T> {
  store(t: Partial<T>): Promise<T | undefined>

  findAll(): Promise<T[] | undefined>

  storeAll(tArray: T[]): Promise<T[] | undefined>
}