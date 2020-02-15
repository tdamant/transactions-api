import {Store} from "./Store";
import uuid from "uuid";
import {PostgresDatabase} from "../database/postgres/PostgresDatabase";

export interface User {
  accessToken: string,
  refreshToken: string,
  id: string
}


export const randomString = (prefix = 'string') => {
  return `${prefix}${Math.floor(Math.random() * 1000000)}`
};


export const buildUser = (user: Partial<User>): User => {
  return {
    ...{
      accessToken: randomString(),
      refreshToken: randomString(),
      id: uuid()
    },
    ...user
  }
};

export class InMemoryUserStore implements Store<User> {
    storeAll(tArray: User[]): Promise<User[] | undefined> {
        throw new Error("Method not implemented.");
    }
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

export class SqlUserStore implements Store<User> {
    storeAll(tArray: User[]): Promise<User[] | undefined> {
        throw new Error("Method not implemented.");
    }
  constructor(private database: PostgresDatabase) {
  }

  async store(partialUser: Partial<User>): Promise<User | undefined> {
    const user = buildUser(partialUser);

    try {
      const sql = `INSERT INTO users (id, access_token, refresh_token) VALUES ('${user.id}', '${user.accessToken}', '${user.refreshToken}') RETURNING *;`;
      const result = await this.database.query(sql);
      if (result.rows.length === 1)  {
        const userFromDB = result.rows[0];
        return {
          id: userFromDB.id,
          accessToken: userFromDB.access_token,
          refreshToken: userFromDB.refresh_token
        }
      }
    } catch (e) {
      console.log(e);
      return undefined
    }
  }

  findAll(): Promise<User[] | undefined> {
    throw new Error("Method not implemented.");
  }
}