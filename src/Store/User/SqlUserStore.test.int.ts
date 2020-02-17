import {PostgresTestServer} from "../../database/postgres/PostgresTestServer";
import {PostgresDatabase} from "../../database/postgres/PostgresDatabase";
import {expect} from "chai";
import {buildUser, SqlUserStore, User} from "./UserStore";
import {Store} from "../Store";
import {randomString} from "../../Utils/random";

describe('SqlUserStore', function () {
  this.timeout(30000);
  let userStore: Store<User>;
  const testPostgresServer = new PostgresTestServer();
  let database: PostgresDatabase;

  before(async () => {
    database = await testPostgresServer.startAndGetDB();
    userStore = new SqlUserStore(database);
  });

  after(async () => {
    await testPostgresServer.stop();
  });

  afterEach(async () => {
    await database.query('TRUNCATE TABLE users CASCADE;');
  });
  it('should store a user', async () => {
    const expectedUser = {
      id: randomString(),
      accessToken: randomString(),
      refreshToken: randomString()
    };
    const user = buildUser(expectedUser);
    await userStore.store(user);
    const usersInTable = (await database.query('select * from users;')).rows;
    expect(usersInTable.length).to.eql(1);
    expect(usersInTable[0]).to.eql({
      "access_token": expectedUser.accessToken,
      "id": expectedUser.id,
      "refresh_token": expectedUser.refreshToken
    })
  })
});
