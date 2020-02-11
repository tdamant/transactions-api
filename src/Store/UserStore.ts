import {Store} from "./Store";

export interface User {
  accessToken: string,
  refreshToken: string
}

export class InMemoryUserStore implements Store<User> {
  public users: User[] = [];

  async findAll(): Promise<User[] | undefined> {
    return this.users
  }

  async store(user: User): Promise<User | undefined> {
    this.users.push(user);
    return user
  }
}