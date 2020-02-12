import {Store} from "./Store";
import uuid from "uuid";

export interface User {
  accessToken: string,
  refreshToken: string,
  id: string
}


const randomString = (prefix = 'string') => {
  return `${prefix}${Math.floor(Math.random() * 1000000)}`
};


function buildUser(user: Partial<User>): User {
  return {
    ...{
      accessToken: randomString(),
      refreshToken: randomString(),
      id: uuid()
    },
    ...user
  }
}

export class InMemoryUserStore implements Store<User> {
  public users: User[] = [];

  async findAll(): Promise<User[] | undefined> {
    return this.users
  }

  async store(user: Partial<User>): Promise<User | undefined> {
    const fullUser = buildUser(user);
    this.users.push(fullUser);
    return fullUser
  }
}